export function createObjectUrls(files: File[]) {
  return files.map((file) => URL.createObjectURL(file));
}

export function revokeObjectUrls(urls: string[]) {
  urls.forEach((url) => URL.revokeObjectURL(url));
}
