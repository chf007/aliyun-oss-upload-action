# Aliyun OSS Upload Action

Upload files to aliyun oss.

## Inputs

### `source-dir`

**Required** The path of the source dir.

### `dest-dir`

**Required** The path of the dest dir.

### `bucket`

**Required** The name of the aliyun oss bucket.

### `region`

**Required** The name of the aliyun oss region.

### `endpoint`

The name of the aliyun oss endpoint.

## Example usage

```yaml
uses: chf007/aliyun-oss-upload-action@main
env:
  OSS_ACCESS_KEY_ID: ${{ secrets.OSS_ACCESS_KEY_ID }}
  OSS_ACCESS_KEY_SECRET: ${{ secrets.OSS_ACCESS_KEY_SECRET }}
with:
  source-dir: 'dist'
  dest-dir: 'apps/app-test/v1'
  bucket: 'static'
  region: 'oss-cn-shenzhen'
```
