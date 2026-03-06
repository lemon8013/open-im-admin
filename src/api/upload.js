import SparkMD5 from 'spark-md5'
import { IM_URL } from '@/config'

// 生成 operationID
function genOperationID() {
  return Date.now().toString() + Math.floor(Math.random() * 10000)
}

// 通用 fetch 响应处理
async function handleResponse(res) {
  if (!res.ok) throw new Error(res.statusText)
  const data = await res.json()
  if (data.errCode !== 0) throw new Error(data.errMsg)
  return data.data
}

// 获取分片大小
function getPartSize(size) {
  return fetch(`${IM_URL}/object/part_size`, {
    method: 'POST',
    headers: {
      operationID: genOperationID(),
      token: localStorage.getItem('IMAdminToken') || '',
    },
    body: JSON.stringify({ size }),
  }).then(handleResponse)
}

// 初始化分片上传
function initiateMultipartUpload(data) {
  return fetch(`${IM_URL}/object/initiate_multipart_upload`, {
    method: 'POST',
    headers: {
      operationID: genOperationID(),
      token: localStorage.getItem('IMAdminToken') || '',
    },
    body: JSON.stringify(data),
  }).then(handleResponse)
}

// 完成分片上传
function completeMultipartUpload(data) {
  return fetch(`${IM_URL}/object/complete_multipart_upload`, {
    method: 'POST',
    headers: {
      operationID: genOperationID(),
      token: localStorage.getItem('IMAdminToken') || '',
    },
    body: JSON.stringify(data),
  }).then(handleResponse)
}

// MIME 类型映射
const mimeMap = {
  txt: 'text/plain', html: 'text/html', css: 'text/css', js: 'text/javascript',
  json: 'application/json', csv: 'text/csv',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  bmp: 'image/bmp', svg: 'image/svg+xml', webp: 'image/webp', heic: 'image/heic',
  mp3: 'audio/mpeg', mp4: 'video/mp4', wav: 'audio/wav', ogg: 'audio/ogg',
  avi: 'video/x-msvideo', mpeg: 'video/mpeg', mov: 'video/quicktime',
  wmv: 'video/x-ms-wmv', flv: 'video/x-flv', mkv: 'video/x-matroska',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip', tar: 'application/x-tar', rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
}

function getContentType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return mimeMap[ext] || 'application/octet-stream'
}

/**
 * 分片上传文件
 * @param {File} file - 要上传的文件
 * @returns {Promise<{url: string}>} - 上传成功后返回文件 URL
 */
export async function splitUpload(file) {
  try {
    const name = `${localStorage.getItem('IMAdminUserID')}/${file.name}`
    const contentType = getContentType(file.name)

    // 1. 获取分片大小
    const { size: partSize } = await getPartSize(file.size)
    const partCount = Math.ceil(file.size / partSize)

    // 2. 计算每个分片的 MD5 哈希
    const parts = []
    const partHashes = []
    const spark = new SparkMD5.ArrayBuffer()

    for (let i = 0; i < partCount; i++) {
      const start = i * partSize
      const end = Math.min(start + partSize, file.size)
      const blob = file.slice(start, end)
      parts.push({ start, end })

      const buffer = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(blob)
        reader.onload = (e) => {
          if (e.target) {
            spark.append(e.target.result)
            resolve(spark.end())
          }
        }
        reader.onerror = reject
      })
      partHashes.push(buffer)
    }

    // 3. 计算整体哈希
    const overallHash = partHashes.join(',')
    const hashSpark = new SparkMD5()
    hashSpark.append(overallHash)

    // 4. 发起分片上传
    const uploadResult = await initiateMultipartUpload({
      hash: hashSpark.end(),
      size: file.size,
      partSize,
      maxParts: -1,
      cause: '',
      name,
      contentType,
    })

    // 如果服务器返回了 url，说明文件已存在（秒传）
    if (uploadResult.url) {
      return { url: uploadResult.url }
    }

    // 5. 上传各分片
    const { upload } = uploadResult
    const { parts: signParts, query, header } = upload.sign

    await Promise.all(
      signParts.map(async (part, idx) => {
        const partUrl = part.url || upload.sign.url
        const urlObj = new URL(partUrl)

        // 添加全局 query 参数
        if (query) {
          const params = new URLSearchParams(urlObj.search)
          query.forEach((q) => params.set(q.key, q.values[0]))
          urlObj.search = params.toString()
        }
        // 添加分片 query 参数
        if (part.query) {
          const params = new URLSearchParams(urlObj.search)
          part.query.forEach((q) => params.set(q.key, q.values[0]))
          urlObj.search = params.toString()
        }

        const headers = new Headers()
        if (header) header.forEach((h) => headers.set(h.key, h.values[0]))
        if (part.header) part.header.forEach((h) => headers.set(h.key, h.values[0]))
        headers.set('Content-Length', (parts[idx].end - parts[idx].start).toString())

        const res = await fetch(urlObj.toString(), {
          method: 'PUT',
          headers,
          body: file.slice(parts[idx].start, parts[idx].end),
        })
        if (!res.ok) throw new Error(`Failed to upload chunk ${idx + 1}`)
      })
    )

    // 6. 完成上传
    const completeResult = await completeMultipartUpload({
      uploadID: upload.uploadID,
      parts: partHashes,
      cause: '',
      name,
      contentType,
    })

    return { url: completeResult.url }
  } catch (error) {
    console.error('Upload failed:', error)
    return { error }
  }
}
