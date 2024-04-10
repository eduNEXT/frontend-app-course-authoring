import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Card, Dropdown, Icon, IconButton, useToggle,
} from '@openedx/paragon';
import { EditOutline as EditIcon, MoreVert as MoveVertIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import DeleteModal from '../../generic/delete-modal/DeleteModal';
import { scrollToElement } from '../../course-outline/utils';
import { getCourseId } from '../data/selectors';
import { COMPONENT_TYPES } from '../constants';
import messages from './messages';

const CourseXBlock = ({
  id, title, type, unitXBlockActions, shouldScroll, ...props
}) => {
  const courseXBlockElementRef = useRef(null);
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useToggle(false);
  const navigate = useNavigate();
  const courseId = useSelector(getCourseId);
  const intl = useIntl();

  const onXBlockDelete = () => {
    unitXBlockActions.handleDelete(id);
    closeDeleteModal();
  };

  const handleEdit = () => {
    switch (type) {
    case COMPONENT_TYPES.html:
    case COMPONENT_TYPES.problem:
    case COMPONENT_TYPES.video:
      navigate(`/course/${courseId}/editor/${type}/${id}`);
      break;
    default:
    }
  };

  useEffect(() => {
    // if this item has been newly added, scroll to it.
    if (courseXBlockElementRef.current && shouldScroll) {
      scrollToElement(courseXBlockElementRef.current);
    }
  }, []);

  return (
    <div ref={courseXBlockElementRef} {...props}>
      <Card className="mb-1">
        <Card.Header
          title={title}
          actions={(
            <ActionRow>
              <IconButton
                alt={intl.formatMessage(messages.blockAltButtonEdit)}
                iconAs={EditIcon}
                size="md"
                onClick={handleEdit}
              />
              <Dropdown>
                <Dropdown.Toggle
                  id={id}
                  as={IconButton}
                  src={MoveVertIcon}
                  alt={intl.formatMessage(messages.blockActionsDropdownAlt)}
                  size="sm"
                  iconAs={Icon}
                />
                <Dropdown.Menu>
                  <Dropdown.Item>
                    {intl.formatMessage(messages.blockLabelButtonCopy)}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => unitXBlockActions.handleDuplicate(id)}>
                    {intl.formatMessage(messages.blockLabelButtonDuplicate)}
                  </Dropdown.Item>
                  <Dropdown.Item>
                    {intl.formatMessage(messages.blockLabelButtonMove)}
                  </Dropdown.Item>
                  <Dropdown.Item>
                    {intl.formatMessage(messages.blockLabelButtonManageAccess)}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={openDeleteModal}>
                    {intl.formatMessage(messages.blockLabelButtonDelete)}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <DeleteModal
                category="component"
                isOpen={isDeleteModalOpen}
                close={closeDeleteModal}
                onDeleteSubmit={onXBlockDelete}
              />
            </ActionRow>
          )}
          size="md"
        />
        <Card.Section>
          <div className="w-100 bg-gray-100" style={{ height: 200 }} data-block-id={id} />
        </Card.Section>
      </Card>
    </div>
  );
};

CourseXBlock.defaultProps = {
  shouldScroll: false,
};

CourseXBlock.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  shouldScroll: PropTypes.bool,
  unitXBlockActions: PropTypes.shape({
    handleDelete: PropTypes.func,
    handleDuplicate: PropTypes.func,
  }).isRequired,
};

export default CourseXBlock;
