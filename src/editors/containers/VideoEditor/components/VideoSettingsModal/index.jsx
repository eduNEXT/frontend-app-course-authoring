import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { ArrowBackIos } from '@edx/paragon/icons';
import {
  FormattedMessage,
} from '@edx/frontend-platform/i18n';

// import VideoPreview from './components/VideoPreview';
import ErrorSummary from './ErrorSummary';
import DurationWidget from './components/DurationWidget';
import HandoutWidget from './components/HandoutWidget';
import LicenseWidget from './components/LicenseWidget';
import ThumbnailWidget from './components/ThumbnailWidget';
import TranscriptWidget from './components/TranscriptWidget';
import VideoSourceWidget from './components/VideoSourceWidget';
import VideoPreviewWidget from './components/VideoPreviewWidget';
import './index.scss';
import SocialShareWidget from './components/SocialShareWidget';
import messages from '../../messages';

export const VideoSettingsModal = ({
  showReturn,
  onReturn,
}) => (
  <>
    { showReturn && (
      <Button
        variant="tertiary"
        iconBefore={ArrowBackIos}
        className="mb-2 mb-sm-0"
        size="sm"
        onClick={onReturn}
      >
        <FormattedMessage {...messages.replaceVideoButtonLabel} />
      </Button>
    )}
    <ErrorSummary />
    <VideoPreviewWidget />
    <VideoSourceWidget />
    <SocialShareWidget />
    <ThumbnailWidget />
    <TranscriptWidget />
    <DurationWidget />
    <HandoutWidget />
    <LicenseWidget />
  </>
);

VideoSettingsModal.propTypes = {
  showReturn: PropTypes.bool.isRequired,
  onReturn: PropTypes.func.isRequired,
};

export default VideoSettingsModal;
