# ClimbCoach API Client

This directory contains a typed API client generated from the ClimbCoach backend OpenAPI specification.

## Architecture

- `generated/` - Auto-generated TypeScript client from OpenAPI spec
- `hooks/` - React hooks that wrap the API client for easier use in components
- `client.ts` - Thin wrapper that configures the API client with authentication

## Usage

### Direct API Usage

```typescript
import getApiClient from '@/lib/api/client';
import { VideosService } from '@/lib/api/generated/services/VideosService';

async function fetchVideos() {
  try {
    const api = await getApiClient();
    const videoService = new VideosService(api.httpRequest);
    
    const videos = await videoService.getApiVideos();
    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}
```

### Using Hooks

```typescript
import useVideos from '@/lib/api/hooks/useVideos';

function MyComponent() {
  const { videos, loading, error, refetch } = useVideos();
  
  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  
  return (
    <View>
      {videos.map(video => (
        <Text key={video.id}>{video.title}</Text>
      ))}
    </View>
  );
}
```

## Type Safety

The API client provides full type safety based on the OpenAPI specification from the backend. All models, request parameters, and response types are generated automatically, enabling:

- Autocompletion for API calls
- Type-checked parameters
- Type-safe response handling

## Regenerating the Client

The API client is automatically regenerated when running:

```bash
npm run generate:api
```

This fetches the latest OpenAPI specification from the running backend service and updates the client accordingly. 

The client is also regenerated before each build and before starting the development server.

## Authentication

The client automatically handles authentication by attaching the JWT token from Supabase to all API requests. If the user is not authenticated, the client will send requests without authentication headers. 