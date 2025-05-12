import {
  Card, Icon, DataTable,
} from '@openedx/paragon';
import {
  OpenInNew, Lock, LinkOff, InfoOutline,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { FC } from 'react';
import { Unit } from '../types';
import messages from './messages';
import LockedInfoIcon from './LockedInfoIcon';

const BrokenLinkHref: FC<{ href: string }> = ({ href }) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open(href, '_blank');
  };

  return (
    <div className="broken-link-container">
      <a href={href} onClick={handleClick} className="broken-link" rel="noreferrer">
        {href}
      </a>
    </div>
  );
};

const GoToBlock: FC<{ block: { url: string } }> = ({ block }) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open(block.url, '_blank');
  };

  return (
    <span style={{ display: 'flex', gap: '.5rem' }}>
      <Icon src={OpenInNew} />
      <a href={block.url} onClick={handleClick} rel="noreferrer">
        Go to Block
      </a>
    </span>
  );
};

const RecommendedManualCheckHeading = () => {
  const intl = useIntl();
  return (
    <span className="d-flex align-items-center font-weight-bold py-2">
      {intl.formatMessage(messages.recommendedManualCheckText)}
      <OverlayTrigger
        key="top"
        placement="top"
        overlay={(
          <Tooltip id="tooltip-top">
            {intl.formatMessage(messages.recommendedManualCheckTooltip)}
          </Tooltip>
            )}
      >
        <Icon className="ml-1 pl-1" src={InfoOutline} />
      </OverlayTrigger>
    </span>
  );
};

interface BrokenLinkTableProps {
  unit: Unit;
  showLockedLinks: boolean;
}

type TableData = {
  blockLink: JSX.Element;
  brokenLink: JSX.Element;
  status: JSX.Element;
}[];

const BrokenLinkTable: FC<BrokenLinkTableProps> = ({
  unit,
  filters,
}) => {
  const brokenLinkList = unit.blocks.reduce(
    (
      acc: TableData,
      block,
    ) => {
      if (
        filters.brokenLinks
            || (!filters.brokenLinks && !filters.externalForbiddenLinks && !filters.lockedLinks)
      ) {
        const blockBrokenLinks = block.brokenLinks.map((link) => ({
          Links: (
            <LinksCol
              block={{ url: block.url, displayName: block.displayName || 'Go to block' }}
              href={link}
            />
          ),
          status: (
            <CustomIcon
              icon={LinkOff}
              message1={messages.brokenLabel}
              message2={messages.brokenInfoTooltip}
            />
          ),
        }));
        acc.push(...blockBrokenLinks);
      }

      if (
        filters.lockedLinks
            || (!filters.brokenLinks && !filters.externalForbiddenLinks && !filters.lockedLinks)
      ) {
        const blockLockedLinks = block.lockedLinks.map((link) => ({
          Links: (
            <LinksCol
              block={{ url: block.url, displayName: block.displayName || 'Go to block' }}
              href={link}
            />
          ),
          status: (
            <CustomIcon
              icon={lockedIcon}
              message1={messages.lockedLabel}
              message2={messages.lockedInfoTooltip}
            />
          ),
        }));

        acc.push(...blockLockedLinks);
      }

      if (
        filters.externalForbiddenLinks
            || (!filters.brokenLinks && !filters.externalForbiddenLinks && !filters.lockedLinks)
      ) {
        const externalForbiddenLinks = block.externalForbiddenLinks.map((link) => ({
          Links: (
            <LinksCol
              block={{ url: block.url, displayName: block.displayName || 'Go to block' }}
              href={link}
            />
          ),
          status: (
            <CustomIcon
              icon={ManualIcon}
              message1={messages.manualLabel}
              message2={messages.manualInfoTooltip}
            />
          ),
        }));

        acc.push(...externalForbiddenLinks);
      }

      return acc;
    },
    [],
  );

  return (
    <Card className="unit-card rounded-sm pt-2 pb-3 pl-3 pr-4 mb-2.5">
      <p className="unit-header">{unit.displayName}</p>
      <DataTable
        data={brokenLinkList}
        itemCount={brokenLinkList.length}
        columns={[
          {
            accessor: 'Links',
            width: 'col-9',
          },
          {
            accessor: 'status',
            width: 'col-3',
          },
        ]}
      />
    </Card>
  );
};

export default BrokenLinkTable;
