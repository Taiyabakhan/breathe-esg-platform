from rest_framework import serializers
from .models import Tenant, DataUpload, NormalizedEmissionRecord, AuditLog

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'

class NormalizedEmissionRecordSerializer(serializers.ModelSerializer):
    audit_logs = AuditLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = NormalizedEmissionRecord
        fields = '__all__'

class DataUploadSerializer(serializers.ModelSerializer):
    records_count = serializers.IntegerField(source='records.count', read_only=True)
    
    class Meta:
        model = DataUpload
        fields = '__all__'
