export async function saveToBlob(base64String: string) {
  const response = await fetch(base64String);
  const blob = await response.blob();

  // Use the blob (e.g., for uploading or creating a download link)
  console.log(blob);
  return blob;
}
