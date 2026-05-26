from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TenantViewSet, DataUploadViewSet, NormalizedEmissionRecordViewSet,
    IngestSAPView, IngestUtilityView, IngestTravelView
)

router = DefaultRouter()
router.register(r'tenants', TenantViewSet)
router.register(r'uploads', DataUploadViewSet)
router.register(r'records', NormalizedEmissionRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ingest/sap/', IngestSAPView.as_view(), name='ingest-sap'),
    path('ingest/utility/', IngestUtilityView.as_view(), name='ingest-utility'),
    path('ingest/travel/', IngestTravelView.as_view(), name='ingest-travel'),
]
