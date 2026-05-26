# pyrefly: ignore [missing-import]
from django.db import models

class Tenant(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class DataUpload(models.Model):
    SOURCE_CHOICES = [
        ('SAP_PROCUREMENT', 'SAP Procurement & Fuel'),
        ('UTILITY_ELECTRICITY', 'Utility Electricity'),
        ('TRAVEL_CONCUR', 'Corporate Travel (Concur)'),
    ]
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='uploads')
    source_type = models.CharField(max_length=50, choices=SOURCE_CHOICES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.CharField(max_length=255, default='system')
    
    def __str__(self):
        return f"{self.get_source_type_display()} on {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"

class NormalizedEmissionRecord(models.Model):
    SCOPE_CHOICES = [
        ('SCOPE_1', 'Scope 1 (Direct)'),
        ('SCOPE_2', 'Scope 2 (Indirect - Owned)'),
        ('SCOPE_3', 'Scope 3 (Indirect - Value Chain)'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved (Locked)'),
        ('REJECTED', 'Rejected'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='emission_records')
    upload = models.ForeignKey(DataUpload, on_delete=models.CASCADE, related_name='records')
    source_type = models.CharField(max_length=50, choices=DataUpload.SOURCE_CHOICES)
    scope_category = models.CharField(max_length=20, choices=SCOPE_CHOICES)
    
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    
    quantity = models.DecimalField(max_digits=20, decimal_places=4, null=True, blank=True)
    normalized_unit = models.CharField(max_length=50, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    is_edited = models.BooleanField(default=False)
    
    raw_payload = models.JSONField(help_text="The exact original row or object from the source")
    validation_errors = models.JSONField(default=dict, blank=True, help_text="Any normalization or mapping errors")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.scope_category} - {self.quantity} {self.normalized_unit} ({self.status})"

class AuditLog(models.Model):
    record = models.ForeignKey(NormalizedEmissionRecord, on_delete=models.CASCADE, related_name='audit_logs')
    changed_by = models.CharField(max_length=255)
    changed_at = models.DateTimeField(auto_now_add=True)
    field_name = models.CharField(max_length=255)
    old_value = models.TextField(null=True, blank=True)
    new_value = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Edited {self.field_name} on {self.record.id}"
