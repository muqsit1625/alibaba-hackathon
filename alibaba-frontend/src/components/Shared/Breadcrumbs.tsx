import { colors } from 'global/colors';
import { Breadcrumb } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useStateValue } from 'components/contexts/StateProvider/StateProvider';

type BreadcrumbItem = {
  link: string;
  label: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export const Breadcrumbs = ({ items }: BreadcrumbProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [reducerState]: any = useStateValue();

  return (
    <StyledBreadcrumb isDirectionRtl={reducerState.isDirectionRtl}>
      {items.map((item, index) => (
        <Breadcrumb.Item onClick={() => item.link && navigate(item.link)} active={index === items.length - 1}>
          {item.label}
        </Breadcrumb.Item>
      ))}
    </StyledBreadcrumb>
  );
};

const StyledBreadcrumb = styled(Breadcrumb)<{ isDirectionRtl: boolean }>`
  .breadcrumb {
    margin-bottom: 1.125rem;
    font-size: 12px;
  }

  .breadcrumb-item a {
    color: ${colors.dgray};
    text-decoration: none;
  }

  .breadcrumb-item.active {
    font-weight: bold;
  }

  .breadcrumb-item + .breadcrumb-item::before {
    float: ${(props) => (props.isDirectionRtl ? 'right' : 'left')};
    padding-left: ${(props) => (props.isDirectionRtl ? '8px' : '0')};
  }

  .breadcrumb-item:not(:first-of-type)::before {
    content: var(--bs-breadcrumb-divider, '>');
  }

  @media screen and (max-width: 500px) {
    .breadcrumb-item {
      font-size: 0.85rem;
    }
  }

  @media screen and (max-width: 400px) {
    .breadcrumb-item {
      font-size: 0.75rem;
    }
  }
`;
