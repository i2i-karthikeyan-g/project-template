
export const getColoredFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'txt':
      return 'pi pi-file text-gray-500';
    case 'pdf':
      return 'pi pi-file-pdf text-red-500';
    case 'doc':
    case 'docx':
      return 'pi pi-file-word text-blue-500';
    case 'xls':
    case 'xlsx':
      return 'pi pi-file-excel text-green-500';
    case 'ppt':
    case 'pptx':
      return 'pi pi-file text-orange-500';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
      return 'pi pi-image text-purple-500';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return 'pi pi-file-import text-yellow-500';
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
      return 'pi pi-volume-up text-pink-500';
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
    case 'mkv':
      return 'pi pi-video text-teal-500';
    default:
      return 'pi pi-file text-gray-400';
  }
};

export const getFileNameFromUrl = (url: string): string => {
  const cleanUrl = url.split('?')[0].split('#')[0];
  const pathParts = cleanUrl.split('/');
  return pathParts[pathParts.length - 1] || '';
};

export const downloadFile = async (url: string, fileName?: string): Promise<void> => {
  try {
    const fileNameWithExtension = fileName || getFileNameFromUrl(url);
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);


    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileNameWithExtension;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download file');
  }
};

