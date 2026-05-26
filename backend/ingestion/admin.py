from django.contrib import admin
from .models import (
    Tenant,
    DataUpload,
    NormalizedEmissionRecord,
    AuditLog
)

admin.site.register(Tenant)
admin.site.register(DataUpload)
admin.site.register(NormalizedEmissionRecord)
admin.site.register(AuditLog)