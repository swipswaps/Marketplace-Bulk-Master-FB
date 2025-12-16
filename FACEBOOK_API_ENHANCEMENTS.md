# Facebook API Code Enhancements

## Executive Summary

This document outlines **applicable Facebook Graph API enhancements** for the Marketplace Bulk Master application. All enhancements preserve existing features while adding direct API integration capabilities for automated product catalog management.

**Current State**: Excel-based bulk upload workflow (manual upload to Facebook)  
**Enhanced State**: Direct API integration + Excel workflow (automated + manual options)

---

## 🎯 Applicable Facebook API Integrations

### 1. **Product Catalog API Integration** ⭐ HIGH PRIORITY

**What It Does**: Direct programmatic access to Facebook Product Catalogs via Graph API

**API Endpoint**: `/{product-catalog-id}/items_batch`  
**Documentation**: Facebook Graph API v24.0 - Product Catalog Items Batch

#### Benefits

- ✅ **Automated Upload**: Push products directly to Facebook without manual Excel upload
- ✅ **Real-time Sync**: Update inventory instantly when changes are made
- ✅ **Bulk Operations**: Create, update, delete up to 5,000 items per API call
- ✅ **Error Handling**: Get immediate validation feedback from Facebook
- ✅ **Scheduled Sync**: Auto-sync inventory at specified intervals

#### Implementation Details

**Required Permissions**:

- `catalog_management` - Manage product catalogs
- `business_management` - Access Business Manager

**API Request Structure**:

```javascript
POST https://graph.facebook.com/v24.0/{catalog-id}/items_batch
Content-Type: application/json
Authorization: Bearer {access-token}

{
  "requests": [
    {
      "method": "CREATE",
      "retailer_id": "unique-product-id",
      "data": {
        "title": "Product Title",
        "description": "Product Description",
        "price": "99.99 USD",
        "availability": "in stock",
        "condition": "new",
        "url": "https://example.com/product",
        "image_url": "https://example.com/image.jpg",
        "brand": "Brand Name",
        "category": "Electronics"
      }
    }
  ]
}
```

**Response Handling**:

```javascript
{
  "handles": ["handle-1", "handle-2"],
  "validation_status": [
    {
      "retailer_id": "unique-product-id",
      "errors": [],
      "warnings": []
    }
  ]
}
```

#### Code Enhancement Areas

**New Service**: `services/facebookCatalogService.ts`

- `authenticateWithFacebook()` - OAuth 2.0 flow
- `getCatalogs()` - List available catalogs
- `syncAdsToCatalog(ads, catalogId)` - Bulk upload
- `updateCatalogItems(ads, catalogId)` - Bulk update
- `deleteCatalogItems(ids, catalogId)` - Bulk delete
- `getCatalogSyncStatus(catalogId)` - Check sync status

**Enhanced Components**:

- Add "Sync to Facebook" button in header
- Add catalog selection dropdown
- Add sync status indicator
- Add last sync timestamp display

**New State Management**:

- Facebook access token storage (secure)
- Selected catalog ID
- Sync status (idle, syncing, success, error)
- Last sync timestamp

---

### 2. **OAuth 2.0 Authentication** ⭐ HIGH PRIORITY

**What It Does**: Secure user authentication with Facebook to obtain API access tokens

**API Endpoint**: Facebook Login OAuth Flow  
**Documentation**: Facebook Login for Web

#### Benefits

- ✅ **Secure Access**: Industry-standard OAuth 2.0 authentication
- ✅ **User Permissions**: Request only necessary permissions
- ✅ **Token Management**: Automatic token refresh
- ✅ **Multi-Account**: Support multiple Facebook Business accounts

#### Implementation Details

**OAuth Flow**:

1. User clicks "Connect Facebook Account"
2. Redirect to Facebook Login dialog
3. User grants permissions
4. Receive authorization code
5. Exchange code for access token
6. Store token securely (encrypted localStorage or backend)

**Required Setup**:

- Create Facebook App in Meta for Developers
- Configure OAuth redirect URIs
- Add Facebook Login product
- Request app review for permissions

**Code Enhancement**:

```typescript
// services/facebookAuthService.ts
export const initiateFacebookLogin = () => {
  const clientId = process.env.FACEBOOK_APP_ID;
  const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
  const scope = 'catalog_management,business_management';

  window.location.href =
    `https://www.facebook.com/v24.0/dialog/oauth?` +
    `client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
};

export const handleAuthCallback = async (code: string) => {
  // Exchange code for access token
  const response = await fetch('/api/facebook/token', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  const { access_token, expires_in } = await response.json();
  // Store securely
  return access_token;
};
```

---

### 4. **Product Feed API for Scheduled Updates** ⭐ MEDIUM PRIORITY

**What It Does**: Automatically sync product data on a schedule via feed URLs

**API Endpoint**: `/{catalog-id}/product_feeds`
**Documentation**: Facebook Product Feed API

#### Benefits

- ✅ **Automated Sync**: Schedule hourly, daily, or weekly updates
- ✅ **Feed Hosting**: Upload feed file to server, Facebook fetches automatically
- ✅ **Change Detection**: Only updates changed products
- ✅ **Reduced API Calls**: More efficient than manual batch uploads

#### Implementation Details

**Feed Generation**:

```typescript
// services/facebookFeedService.ts
export const generateProductFeed = (ads: Ad[]): string => {
  // Generate CSV or XML feed format
  const csvRows = ['id,title,description,price,availability,condition,link,image_link'];

  ads.forEach(ad => {
    csvRows.push(
      [
        ad.id,
        ad.title,
        ad.description,
        `${ad.price} USD`,
        'in stock',
        ad.condition.toLowerCase(),
        `https://yoursite.com/products/${ad.id}`,
        `https://yoursite.com/images/${ad.id}.jpg`,
      ].join(',')
    );
  });

  return csvRows.join('\n');
};

export const uploadFeedToServer = async (feedContent: string) => {
  // Upload to your server's public URL
  await fetch('/api/feeds/upload', {
    method: 'POST',
    body: feedContent,
  });

  return 'https://yoursite.com/feeds/products.csv';
};

export const registerFeedWithFacebook = async (
  catalogId: string,
  feedUrl: string,
  accessToken: string
) => {
  const response = await fetch(`https://graph.facebook.com/v24.0/${catalogId}/product_feeds`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Marketplace Bulk Master Feed',
      url: feedUrl,
      schedule: 'DAILY', // or HOURLY, WEEKLY
    }),
  });

  return response.json();
};
```

---

### 5. **Commerce Manager Integration** ⭐ LOW PRIORITY

**What It Does**: Deep link to Commerce Manager for advanced catalog management

**Benefits**:

- ✅ **Quick Access**: Direct links to specific products in Commerce Manager
- ✅ **Advanced Features**: Access features not available via API
- ✅ **Visual Management**: Use Facebook's UI for complex operations

#### Implementation Details

**Deep Linking**:

```typescript
// utils/facebookLinks.ts
export const getCommerceManagerUrl = (catalogId: string) => {
  return `https://business.facebook.com/commerce/catalogs/${catalogId}`;
};

export const getProductEditUrl = (catalogId: string, productId: string) => {
  return `https://business.facebook.com/commerce/catalogs/${catalogId}/products/${productId}`;
};
```

**UI Enhancement**:

- Add "View in Commerce Manager" button for each ad
- Add "Open Catalog" link in header

---

### 6. **Real-time Validation API** ⭐ MEDIUM PRIORITY

**What It Does**: Validate product data against Facebook's requirements before upload

**API Endpoint**: `/{catalog-id}/items_batch` (with validation-only mode)

#### Benefits

- ✅ **Pre-flight Checks**: Catch errors before actual upload
- ✅ **Better UX**: Show Facebook-specific validation errors in UI
- ✅ **Compliance**: Ensure products meet Facebook policies
- ✅ **Reduced Rejections**: Fix issues before submission

#### Implementation Details

**Validation Service**:

```typescript
// services/facebookValidationService.ts
export const validateAdForFacebook = async (
  ad: Ad,
  catalogId: string,
  accessToken: string
): Promise<ValidationResult> => {
  // Call Facebook API with dry-run mode
  const response = await fetch(`https://graph.facebook.com/v24.0/${catalogId}/items_batch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          method: 'CREATE',
          retailer_id: ad.id,
          data: mapAdToFacebookProduct(ad),
        },
      ],
      validation_only: true, // Dry-run mode
    }),
  });

  const result = await response.json();
  return {
    isValid: result.validation_status[0].errors.length === 0,
    errors: result.validation_status[0].errors,
    warnings: result.validation_status[0].warnings,
  };
};
```

**UI Integration**:

- Add "Validate with Facebook" button
- Show Facebook-specific errors alongside local validation
- Add warning badges for Facebook policy issues

---

### 7. **Image Upload API** ⭐ LOW PRIORITY

**What It Does**: Upload product images directly to Facebook's CDN

**API Endpoint**: `/{catalog-id}/product_images`

#### Benefits

- ✅ **Hosted Images**: No need for external image hosting
- ✅ **Optimized Delivery**: Facebook's CDN for fast loading
- ✅ **Image Validation**: Automatic format and size validation

#### Implementation Details

**Image Upload**:

```typescript
// services/facebookImageService.ts
export const uploadProductImage = async (
  imageFile: File,
  catalogId: string,
  accessToken: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`https://graph.facebook.com/v24.0/${catalogId}/product_images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const result = await response.json();
  return result.url; // Facebook-hosted image URL
};
```

**UI Enhancement**:

- Add image upload field to AdForm
- Show image preview
- Store Facebook image URL in ad.other_fields

---

## 🏗️ Implementation Architecture

### New File Structure

```
services/
├── facebook/
│   ├── facebookAuthService.ts       # OAuth authentication
│   ├── facebookCatalogService.ts    # Catalog CRUD operations
│   ├── facebookFeedService.ts       # Feed generation & management
│   ├── facebookValidationService.ts # Pre-upload validation
│   ├── facebookImageService.ts      # Image upload
│   └── facebookApiClient.ts         # Base API client with retry logic
├── adRepository.ts                   # Existing
└── excelService.ts                   # Existing

components/
├── facebook/
│   ├── FacebookAuthButton.tsx       # Login/logout button
│   ├── CatalogSelector.tsx          # Catalog dropdown
│   ├── SyncStatusIndicator.tsx      # Sync progress/status
│   └── FacebookValidationErrors.tsx # FB-specific error display
├── AdForm.tsx                        # Enhanced with FB validation
├── AdList.tsx                        # Enhanced with sync status
└── ...

types/
├── facebook.ts                       # Facebook API types
└── types.ts                          # Existing

utils/
├── facebookLinks.ts                  # Deep link generators
└── encryption.ts                     # Token encryption utilities
```

---

## 📋 Required Setup & Configuration

### 1. Facebook App Creation

**Steps**:

1. Go to https://developers.facebook.com/apps
2. Create new app → Business type
3. Add products:
   - Facebook Login
   - Marketing API
4. Configure OAuth redirect URIs
5. Request permissions:
   - `catalog_management`
   - `business_management`
6. Submit for App Review (required for production)

### 2. Environment Variables

```env
# .env.local
VITE_FACEBOOK_APP_ID=your_app_id
VITE_FACEBOOK_APP_SECRET=your_app_secret
VITE_FACEBOOK_API_VERSION=v24.0
VITE_FACEBOOK_REDIRECT_URI=https://yoursite.com/auth/callback
```

### 3. Backend Requirements (Optional but Recommended)

For production security, implement a backend proxy:

```
Backend API (Node.js/Python/etc.)
├── /api/facebook/auth          # Handle OAuth token exchange
├── /api/facebook/refresh       # Refresh access tokens
├── /api/facebook/catalogs      # Proxy catalog operations
└── /api/feeds/upload           # Host product feed files
```

**Why Backend?**:

- ✅ Secure token storage (not in browser)
- ✅ Hide app secret from client
- ✅ Implement rate limiting
- ✅ Add request logging/monitoring

---

## 🎯 Implementation Priority & Effort

| Enhancement            | Priority | Effort | Impact | Dependencies          |
| ---------------------- | -------- | ------ | ------ | --------------------- |
| OAuth Authentication   | HIGH     | Medium | High   | Facebook App          |
| Catalog Batch API      | HIGH     | High   | High   | OAuth                 |
| Real-time Validation   | MEDIUM   | Medium | Medium | OAuth, Catalog API    |
| Product Feed API       | MEDIUM   | Medium | Medium | OAuth, Server hosting |
| Commerce Manager Links | LOW      | Low    | Low    | None                  |
| Image Upload API       | LOW      | Medium | Low    | OAuth                 |

---

## 🚀 Phased Rollout Plan

### Phase 1: Foundation (Week 1-2)

- ✅ Create Facebook App
- ✅ Implement OAuth authentication
- ✅ Add "Connect Facebook" UI
- ✅ Store access tokens securely
- ✅ Fetch and display user's catalogs

### Phase 2: Core Integration (Week 3-4)

- ✅ Implement Catalog Batch API service
- ✅ Add "Sync to Facebook" button
- ✅ Build batch upload logic
- ✅ Add sync status indicators
- ✅ Implement error handling

### Phase 3: Enhanced Features (Week 5-6)

- ✅ Add real-time validation
- ✅ Implement Product Feed API
- ✅ Add scheduled sync options
- ✅ Build sync history log

### Phase 4: Polish & Optimization (Week 7-8)

- ✅ Add image upload support
- ✅ Implement retry logic
- ✅ Add Commerce Manager deep links
- ✅ Performance optimization
- ✅ Comprehensive testing

---

## ⚠️ Important Considerations

### Rate Limits

- **Catalog Batch API**: 200 requests/hour, 5,000 items/request
- **Graph API**: Standard rate limits apply
- **Solution**: Implement queue system with exponential backoff

### Data Mapping

Current Excel format → Facebook Product Catalog format:

| Excel Field    | Facebook Field          | Required | Notes                |
| -------------- | ----------------------- | -------- | -------------------- |
| TITLE          | title                   | Yes      | Max 150 chars        |
| PRICE          | price                   | Yes      | Format: "99.99 USD"  |
| CONDITION      | condition               | Yes      | new/refurbished/used |
| DESCRIPTION    | description             | Yes      | Max 5,000 chars      |
| CATEGORY       | google_product_category | No       | Use Google taxonomy  |
| OFFER SHIPPING | shipping                | No       | Custom field         |
| -              | availability            | Yes      | Default: "in stock"  |
| -              | url                     | Yes      | Product page URL     |
| -              | image_url               | Yes      | Product image URL    |

**Missing Required Fields**:

- `url` - Product landing page (need to add)
- `image_url` - Product image (need to add)
- `availability` - Stock status (can default to "in stock")

### Security Best Practices

- ✅ Never store access tokens in plain text
- ✅ Use HTTPS for all API calls
- ✅ Implement token refresh logic
- ✅ Add request signing for sensitive operations
- ✅ Validate all user inputs
- ✅ Use environment variables for secrets

### Error Handling

- ✅ Handle network failures gracefully
- ✅ Retry failed requests with exponential backoff
- ✅ Show user-friendly error messages
- ✅ Log errors for debugging
- ✅ Implement fallback to Excel export

---

## 📊 Expected Benefits

### Time Savings

- **Current**: Manual Excel upload (5-10 minutes per batch)
- **With API**: Automated sync (30 seconds, unattended)
- **Savings**: ~90% time reduction

### Error Reduction

- **Current**: Manual validation, errors discovered after upload
- **With API**: Real-time validation, errors caught before upload
- **Improvement**: ~70% fewer rejected listings

### Scalability

- **Current**: Limited to 50 items per Excel file
- **With API**: Up to 5,000 items per batch
- **Improvement**: 100x capacity increase

---

## 🔗 Additional Resources

- [Facebook Marketing API Documentation](https://developers.facebook.com/docs/marketing-api/)
- [Product Catalog API Reference](https://developers.facebook.com/docs/marketing-api/catalog/)
- [Facebook Login for Web](https://developers.facebook.com/docs/facebook-login/web)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Commerce Manager](https://business.facebook.com/commerce/)

---

## ✅ Summary

All proposed enhancements **preserve existing Excel-based workflow** while adding powerful API automation capabilities. Users can choose between:

1. **Manual Mode** (Current): Excel import/export workflow
2. **Hybrid Mode** (New): Edit locally, sync to Facebook via API
3. **Automated Mode** (New): Scheduled automatic syncing

This approach ensures backward compatibility while providing significant productivity improvements for power users.

### 3. **Catalog Batch API for Bulk Operations** ⭐ MEDIUM PRIORITY

**What It Does**: Efficiently manage large product inventories with batch operations

**API Endpoint**: `/{catalog-id}/items_batch`  
**Rate Limits**: 5,000 items per request, 200 requests per hour

#### Benefits

- ✅ **High Performance**: Process thousands of items in single request
- ✅ **Atomic Operations**: All-or-nothing transaction support
- ✅ **Validation**: Pre-upload validation with detailed error messages
- ✅ **Retry Logic**: Handle rate limits gracefully

#### Implementation Details

**Batch Processing Strategy**:

```typescript
// services/facebookCatalogService.ts
export const syncAdsToCatalogBatch = async (ads: Ad[], catalogId: string, accessToken: string) => {
  const BATCH_SIZE = 5000;
  const batches = chunkArray(ads, BATCH_SIZE);

  const results = [];

  for (const batch of batches) {
    const requests = batch.map(ad => ({
      method: 'CREATE',
      retailer_id: ad.id,
      data: mapAdToFacebookProduct(ad),
    }));

    const response = await fetch(`https://graph.facebook.com/v24.0/${catalogId}/items_batch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    results.push(await response.json());

    // Rate limit handling
    await sleep(3600000 / 200); // 200 requests per hour
  }

  return results;
};
```

---
