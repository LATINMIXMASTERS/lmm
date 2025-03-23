
import React from 'react';
import { useTrackUploadForm } from '@/hooks/useTrackUploadForm';
import TrackInfoFields from './TrackInfoFields';
import CoverImageUpload from './CoverImageUpload';
import AudioFileUpload from './AudioFileUpload';
import UploadProgress from './UploadProgress';
import S3ConfigAlert from './S3ConfigAlert';
import SubmitButton from './SubmitButton';

const UploadForm: React.FC = () => {
  const {
    title,
    setTitle,
    selectedArtistId,
    setSelectedArtistId,
    selectedGenre,
    setSelectedGenre,
    coverImage,
    setCoverImage,
    audioFile,
    setAudioFile,
    coverPreview,
    setCoverPreview,
    isUploading,
    uploadProgress,
    coverProgress,
    s3Configured,
    uploadError,
    handleSubmit,
    maxFileSize
  } = useTrackUploadForm();
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <S3ConfigAlert s3Configured={s3Configured} />
      
      <TrackInfoFields 
        title={title}
        setTitle={setTitle}
        selectedArtistId={selectedArtistId}
        setSelectedArtistId={setSelectedArtistId}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
      />
      
      <CoverImageUpload
        coverPreview={coverPreview}
        setCoverPreview={setCoverPreview}
        setCoverImage={setCoverImage}
      />
      
      <AudioFileUpload
        audioFile={audioFile}
        setAudioFile={setAudioFile}
        maxFileSize={maxFileSize}
      />
      
      <UploadProgress
        isUploading={isUploading}
        coverProgress={coverProgress}
        uploadProgress={uploadProgress}
        uploadError={uploadError}
      />
      
      <SubmitButton
        isUploading={isUploading}
        isDisabled={!title || !selectedArtistId || !selectedGenre || !coverImage || !audioFile}
      />
    </form>
  );
};

export default UploadForm;
