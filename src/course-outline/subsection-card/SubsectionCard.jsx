// @ts-check
import React, {
  useContext, useEffect, useState, useRef, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, StandardModal, useToggle } from '@openedx/paragon';
import { Add as IconAdd } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

import CourseOutlineSubsectionCardExtraActionsSlot from '../../plugin-slots/CourseOutlineSubsectionCardExtraActionsSlot';
import { setCurrentItem, setCurrentSection, setCurrentSubsection } from '../data/slice';
import { RequestStatus } from '../../data/constants';
import CardHeader from '../card-header/CardHeader';
import SortableItem from '../drag-helper/SortableItem';
import { DragContext } from '../drag-helper/DragContextProvider';
import { useClipboard, PasteComponent } from '../../generic/clipboard';
import TitleButton from '../card-header/TitleButton';
import XBlockStatus from '../xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '../utils';
import messages from './messages';
import { ComponentPicker } from '../../library-authoring';
import { COMPONENT_TYPES } from '../../generic/block-type-utils/constants';
import { ContainerType } from '../../generic/key-utils';
import { ContentType } from '../../library-authoring/routes';
import { getStudioHomeData } from '../../studio-home/data/selectors';

const SubsectionCard = ({
  section,
  subsection,
  isSectionsExpanded,
  isSelfPaced,
  isCustomRelativeDatesActive,
  children,
  index,
  getPossibleMoves,
  onOpenPublishModal,
  onEditSubmit,
  savingStatus,
  onOpenDeleteModal,
  onDuplicateSubmit,
  onNewUnitSubmit,
  onAddUnitFromLibrary,
  onOrderChange,
  onOpenConfigureModal,
  onPasteClick,
}) => {
  const currentRef = useRef(null);
  const intl = useIntl();
  const dispatch = useDispatch();
  const { activeId, overId } = useContext(DragContext);
  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const isScrolledToElement = locatorId === subsection.id;
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const namePrefix = 'subsection';
  const { sharedClipboardData, showPasteUnit } = useClipboard();
  // WARNING: Do not use "useStudioHome" to get "librariesV2Enabled" flag below,
  // as it has a useEffect that fetches course waffle flags whenever
  // location.search is updated. Course search updates location.search when
  // user types, which will then trigger the useEffect and reload the page.
  // See https://github.com/openedx/frontend-app-authoring/pull/1938.
  const { librariesV2Enabled } = useSelector(getStudioHomeData);
  const [
    isAddLibraryUnitModalOpen,
    openAddLibraryUnitModal,
    closeAddLibraryUnitModal,
  ] = useToggle(false);

  const {
    id,
    category,
    displayName,
    hasChanges,
    published,
    visibilityState,
    actions: subsectionActions,
    isHeaderVisible = true,
    enableCopyPasteUnits = false,
    proctoringExamConfigurationLink,
  } = subsection;

  // re-create actions object for customizations
  const actions = { ...subsectionActions };
  // add actions to control display of move up & down menu button.
  const moveUpDetails = getPossibleMoves(index, -1);
  const moveDownDetails = getPossibleMoves(index, 1);
  actions.allowMoveUp = !isEmpty(moveUpDetails);
  actions.allowMoveDown = !isEmpty(moveDownDetails);

  // Expand the subsection if a search result should be shown/scrolled to
  const containsSearchResult = () => {
    if (locatorId) {
      return !!subsection.childInfo?.children?.filter((child) => child.id === locatorId).length;
    }

    return false;
  };
  const [isExpanded, setIsExpanded] = useState(containsSearchResult() || !isHeaderVisible || isSectionsExpanded);
  const subsectionStatus = getItemStatus({
    published,
    visibilityState,
    hasChanges,
  });
  const borderStyle = getItemStatusBorder(subsectionStatus);

  useEffect(() => {
    setIsExpanded(isSectionsExpanded);
  }, [isSectionsExpanded]);

  const handleExpandContent = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const handleClickMenuButton = () => {
    dispatch(setCurrentSection(section));
    dispatch(setCurrentSubsection(subsection));
    dispatch(setCurrentItem(subsection));
  };

  const handleEditSubmit = (titleValue) => {
    if (displayName !== titleValue) {
      onEditSubmit(id, section.id, titleValue);
      return;
    }

    closeForm();
  };

  const handleSubsectionMoveUp = () => {
    onOrderChange(section, moveUpDetails);
  };

  const handleSubsectionMoveDown = () => {
    onOrderChange(section, moveDownDetails);
  };

  const handleNewButtonClick = () => onNewUnitSubmit(id);
  const handlePasteButtonClick = () => onPasteClick(id, section.id);

  const titleComponent = (
    <TitleButton
      title={displayName}
      isExpanded={isExpanded}
      onTitleClick={handleExpandContent}
      namePrefix={namePrefix}
    />
  );

  const extraActionsComponent = (
    <CourseOutlineSubsectionCardExtraActionsSlot
      subsection={subsection}
      section={section}
    />
  );

  useEffect(() => {
    if (activeId === id && isExpanded) {
      setIsExpanded(false);
    } else if (overId === id && !isExpanded) {
      setIsExpanded(true);
    }
  }, [activeId, overId]);

  useEffect(() => {
    // if this items has been newly added, scroll to it.
    // we need to check section.shouldScroll as whole section is fetched when a
    // subsection is duplicated under it.
    if (currentRef.current && (section.shouldScroll || subsection.shouldScroll || isScrolledToElement)) {
      // Align element closer to the top of the screen if scrolling for search result
      const alignWithTop = !!isScrolledToElement;
      scrollToElement(currentRef.current, alignWithTop);
    }
  }, [isScrolledToElement]);

  useEffect(() => {
    // If the locatorId is set/changed, we need to make sure that the subsection is expanded
    // if it contains the result, in order to scroll to it
    setIsExpanded((prevState) => (containsSearchResult() || prevState));
  }, [locatorId, setIsExpanded]);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      closeForm();
    }
  }, [savingStatus]);

  const isDraggable = (
    actions.draggable
      && (actions.allowMoveUp || actions.allowMoveDown)
      && !(isHeaderVisible === false)
  );

  const handleSelectLibraryUnit = useCallback((selectedUnit) => {
    onAddUnitFromLibrary({
      type: COMPONENT_TYPES.libraryV2,
      category: ContainerType.Vertical,
      parentLocator: id,
      libraryContentKey: selectedUnit.usageKey,
    });
    closeAddLibraryUnitModal();
  }, []);

  return (
    <>
      <SortableItem
        id={id}
        category={category}
        key={id}
        isDraggable={isDraggable}
        isDroppable={actions.childAddable}
        componentStyle={{
          background: '#f8f7f6',
          ...borderStyle,
        }}
      >
        <div
          className={`subsection-card ${isScrolledToElement ? 'highlight' : ''}`}
          data-testid="subsection-card"
          ref={currentRef}
        >
          {isHeaderVisible && (
            <>
              <CardHeader
                title={displayName}
                status={subsectionStatus}
                cardId={id}
                hasChanges={hasChanges}
                onClickMenuButton={handleClickMenuButton}
                onClickPublish={onOpenPublishModal}
                onClickEdit={openForm}
                onClickDelete={onOpenDeleteModal}
                onClickMoveUp={handleSubsectionMoveUp}
                onClickMoveDown={handleSubsectionMoveDown}
                onClickConfigure={onOpenConfigureModal}
                isFormOpen={isFormOpen}
                closeForm={closeForm}
                onEditSubmit={handleEditSubmit}
                isDisabledEditField={savingStatus === RequestStatus.IN_PROGRESS}
                onClickDuplicate={onDuplicateSubmit}
                titleComponent={titleComponent}
                namePrefix={namePrefix}
                actions={actions}
                proctoringExamConfigurationLink={proctoringExamConfigurationLink}
                isSequential
                extraActionsComponent={extraActionsComponent}
              />
              <div className="subsection-card__content item-children" data-testid="subsection-card__content">
                <XBlockStatus
                  isSelfPaced={isSelfPaced}
                  isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                  blockData={subsection}
                />
              </div>
            </>
          )}
          {(isExpanded) && (
            <div
              data-testid="subsection-card__units"
              className={classNames('subsection-card__units', { 'item-children': isDraggable })}
            >
              {children}
              {actions.childAddable && (
                <>
                  <Button
                    data-testid="new-unit-button"
                    className="mt-4"
                    variant="outline-primary"
                    iconBefore={IconAdd}
                    block
                    onClick={handleNewButtonClick}
                  >
                    {intl.formatMessage(messages.newUnitButton)}
                  </Button>
                  {enableCopyPasteUnits && showPasteUnit && sharedClipboardData && (
                    <PasteComponent
                      className="mt-4"
                      text={intl.formatMessage(messages.pasteButton)}
                      clipboardData={sharedClipboardData}
                      onClick={handlePasteButtonClick}
                    />
                  )}
                  {librariesV2Enabled && (
                    <Button
                      data-testid="use-unit-from-library"
                      className="mt-4"
                      variant="outline-primary"
                      iconBefore={IconAdd}
                      block
                      onClick={openAddLibraryUnitModal}
                    >
                      {intl.formatMessage(messages.useUnitFromLibraryButton)}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </SortableItem>
      <StandardModal
        title={intl.formatMessage(messages.unitPickerModalTitle)}
        isOpen={isAddLibraryUnitModalOpen}
        onClose={closeAddLibraryUnitModal}
        isOverflowVisible={false}
        size="xl"
      >
        <ComponentPicker
          showOnlyPublished
          extraFilter={['block_type = "unit"']}
          componentPickerMode="single"
          onComponentSelected={handleSelectLibraryUnit}
          visibleTabs={[ContentType.units]}
        />
      </StandardModal>
    </>
  );
};

SubsectionCard.defaultProps = {
  children: null,
};

SubsectionCard.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    shouldScroll: PropTypes.bool,
  }).isRequired,
  subsection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    shouldScroll: PropTypes.bool,
    enableCopyPasteUnits: PropTypes.bool,
    proctoringExamConfigurationLink: PropTypes.string,
    actions: PropTypes.shape({
      deletable: PropTypes.bool.isRequired,
      draggable: PropTypes.bool.isRequired,
      childAddable: PropTypes.bool.isRequired,
      duplicable: PropTypes.bool.isRequired,
    }).isRequired,
    isHeaderVisible: PropTypes.bool,
    childInfo: PropTypes.shape({
      children: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }).isRequired,
  }).isRequired,
  children: PropTypes.node,
  isSectionsExpanded: PropTypes.bool.isRequired,
  isSelfPaced: PropTypes.bool.isRequired,
  isCustomRelativeDatesActive: PropTypes.bool.isRequired,
  onOpenPublishModal: PropTypes.func.isRequired,
  onEditSubmit: PropTypes.func.isRequired,
  savingStatus: PropTypes.string.isRequired,
  onOpenDeleteModal: PropTypes.func.isRequired,
  onDuplicateSubmit: PropTypes.func.isRequired,
  onNewUnitSubmit: PropTypes.func.isRequired,
  onAddUnitFromLibrary: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  getPossibleMoves: PropTypes.func.isRequired,
  onOrderChange: PropTypes.func.isRequired,
  onOpenConfigureModal: PropTypes.func.isRequired,
  onPasteClick: PropTypes.func.isRequired,
};

export default SubsectionCard;
