import csv
import io
import json
from datetime import datetime
from decimal import Decimal, InvalidOperation

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Tenant, DataUpload, NormalizedEmissionRecord, AuditLog
from .serializers import TenantSerializer, DataUploadSerializer, NormalizedEmissionRecordSerializer, AuditLogSerializer

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer

class DataUploadViewSet(viewsets.ModelViewSet):
    queryset = DataUpload.objects.all().order_by('-uploaded_at')
    serializer_class = DataUploadSerializer

class NormalizedEmissionRecordViewSet(viewsets.ModelViewSet):
    queryset = NormalizedEmissionRecord.objects.all().order_by('-created_at')
    serializer_class = NormalizedEmissionRecordSerializer

    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        record_ids = request.data.get('record_ids', [])
        NormalizedEmissionRecord.objects.filter(id__in=record_ids, status='PENDING').update(status='APPROVED')
        return Response({'status': 'success'})

    def perform_update(self, serializer):
        instance = self.get_object()
        original_quantity = instance.quantity
        original_unit = instance.normalized_unit
        
        updated_instance = serializer.save(is_edited=True, validation_errors={})
        
        if updated_instance.quantity != original_quantity:
            AuditLog.objects.create(
                record=updated_instance,
                changed_by='analyst',
                field_name='quantity',
                old_value=str(original_quantity),
                new_value=str(updated_instance.quantity)
            )
        if updated_instance.normalized_unit != original_unit:
            AuditLog.objects.create(
                record=updated_instance,
                changed_by='analyst',
                field_name='normalized_unit',
                old_value=str(original_unit),
                new_value=str(updated_instance.normalized_unit)
            )

# MOCK lookup table for SAP plants
SAP_PLANT_MAPPING = {
    'W001': 'SCOPE_1', # e.g. Factory producing direct emissions
    'HQ01': 'SCOPE_2', # e.g. Office, mostly electricity
}

class IngestSAPView(APIView):
    def post(self, request, *args, **kwargs):
        tenant_id = request.data.get('tenant_id')
        file_obj = request.FILES.get('file')
        
        if not file_obj or not tenant_id:
            return Response({"error": "Missing file or tenant_id"}, status=400)
            
        tenant = Tenant.objects.get(id=tenant_id)
        upload = DataUpload.objects.create(
            tenant=tenant, 
            source_type='SAP_PROCUREMENT',
            uploaded_by='system_api'
        )
        
        decoded_file = file_obj.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        records_created = 0
        for row in reader:
            plant = row.get('Werk', '')
            quantity_str = row.get('Menge', '')
            unit = row.get('Basismengeneinheit', '')
            date_str = row.get('Buchungsdatum', '')
            
            errors = {}
            scope = SAP_PLANT_MAPPING.get(plant, 'SCOPE_3')
            if plant and plant not in SAP_PLANT_MAPPING:
                errors['plant'] = f"Unmapped plant code '{plant}'"
                
            try:
                quantity = Decimal(quantity_str.replace(',', '')) if quantity_str else Decimal(0)
            except InvalidOperation:
                quantity = None
                errors['quantity'] = f"Invalid quantity format '{quantity_str}'"
                
            try:
                date_val = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None
            except ValueError:
                date_val = None
                errors['date'] = f"Invalid date format '{date_str}'"
                
            NormalizedEmissionRecord.objects.create(
                tenant=tenant,
                upload=upload,
                source_type='SAP_PROCUREMENT',
                scope_category=scope,
                date_start=date_val,
                date_end=date_val,
                quantity=quantity,
                normalized_unit=unit.lower() if unit else None,
                raw_payload=row,
                validation_errors=errors
            )
            records_created += 1
            
        return Response({"status": "success", "records_created": records_created, "upload_id": upload.id})

class IngestUtilityView(APIView):
    def post(self, request, *args, **kwargs):
        tenant_id = request.data.get('tenant_id')
        file_obj = request.FILES.get('file')
        
        if not file_obj or not tenant_id:
            return Response({"error": "Missing file or tenant_id"}, status=400)
            
        tenant = Tenant.objects.get(id=tenant_id)
        upload = DataUpload.objects.create(
            tenant=tenant, 
            source_type='UTILITY_ELECTRICITY',
            uploaded_by='system_api'
        )
        
        decoded_file = file_obj.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        records_created = 0
        for row in reader:
            start_date_str = row.get('Start Date', '')
            end_date_str = row.get('End Date', '')
            usage_str = row.get('Usage', '')
            unit = row.get('Units', 'kWh')
            
            errors = {}
            try:
                usage = Decimal(usage_str) if usage_str else Decimal(0)
                if usage == 0 and row.get('Cost') and Decimal(row.get('Cost', 0)) > 0:
                    errors['usage'] = "Cost is > 0 but Usage is 0."
            except InvalidOperation:
                usage = None
                errors['usage'] = f"Invalid usage format '{usage_str}'"
                
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
            except ValueError:
                start_date = None
                end_date = None
                errors['date'] = "Invalid date format, expected YYYY-MM-DD"
                
            NormalizedEmissionRecord.objects.create(
                tenant=tenant,
                upload=upload,
                source_type='UTILITY_ELECTRICITY',
                scope_category='SCOPE_2',
                date_start=start_date,
                date_end=end_date,
                quantity=usage,
                normalized_unit=unit.lower(),
                raw_payload=row,
                validation_errors=errors
            )
            records_created += 1
            
        return Response({"status": "success", "records_created": records_created, "upload_id": upload.id})

class IngestTravelView(APIView):
    def post(self, request, *args, **kwargs):
        tenant_id = request.data.get('tenant_id')
        data = request.data.get('expenses', [])
        
        if not tenant_id:
            return Response({"error": "Missing tenant_id"}, status=400)
            
        tenant = Tenant.objects.get(id=tenant_id)
        upload = DataUpload.objects.create(
            tenant=tenant, 
            source_type='TRAVEL_CONCUR',
            uploaded_by='system_api'
        )
        
        records_created = 0
        for expense in data:
            expense_type = expense.get('expenseTypeCode')
            if expense_type not in ['AIRFR', 'CAR', 'MILEAGE']:
                continue
                
            distance = expense.get('totalDistance', 0)
            unit = expense.get('distanceUnit', 'km')
            date_str = expense.get('transactionDate')
            
            errors = {}
            if not distance:
                errors['distance'] = "Missing totalDistance for travel expense"
                
            try:
                quantity = Decimal(distance) if distance else Decimal(0)
                if unit.lower() == 'miles':
                    quantity = quantity * Decimal('1.60934')
                    unit = 'km'
            except (InvalidOperation, TypeError):
                quantity = None
                errors['distance'] = f"Invalid distance format '{distance}'"
                
            try:
                date_val = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else None
            except (ValueError, TypeError):
                date_val = None
                errors['date'] = "Invalid transactionDate"
                
            NormalizedEmissionRecord.objects.create(
                tenant=tenant,
                upload=upload,
                source_type='TRAVEL_CONCUR',
                scope_category='SCOPE_3',
                date_start=date_val,
                date_end=date_val,
                quantity=quantity,
                normalized_unit=unit,
                raw_payload=expense,
                validation_errors=errors
            )
            records_created += 1
            
        return Response({"status": "success", "records_created": records_created, "upload_id": upload.id})
