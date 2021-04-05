import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, Input } from '@edx/paragon';

import messages from './messages';

function AppCard({
  app, onClick, intl, selected,
}) {
  const supportText = app.hasFullSupport
    ? intl.formatMessage(messages.appFullSupport)
    : intl.formatMessage(messages.appPartialSupport);

  return (
    <Card
      key={app.id}
      tabIndex="-1"
      onClick={() => onClick(app.id)}
      onKeyPress={() => onClick(app.id)}
      role="radio"
      aria-checked={selected}
      style={{
        cursor: 'pointer',
      }}
      className={classNames({
        'border-primary': selected,
      })}
    >
      <div
        className="position-absolute"
        style={{
          top: '0.75rem',
          right: '0.75rem',
        }}
      >
        <Input readOnly type="checkbox" checked={selected} />
      </div>
      <Card.Body>
        <Card.Title>
          {intl.formatMessage(messages[`appName-${app.id}`])}
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{supportText}</Card.Subtitle>
        <Card.Text>{intl.formatMessage(messages[`appDescription-${app.id}`])}</Card.Text>
      </Card.Body>
    </Card>
  );
}

AppCard.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.string.isRequired,
    featureIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    hasFullSupport: PropTypes.bool.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(AppCard);