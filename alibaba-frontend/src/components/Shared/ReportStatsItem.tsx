import styled from 'styled-components';

interface ReportStatsProps {
  title: string;
  stats: string;
  color?: string;
  bgColor?: string;
}

const ReportStatsItem = ({ title, stats, color, bgColor }: ReportStatsProps) => {
  return (
    <ReportStatsItemStyled color={color}>
      <TitleContainer bgColor={bgColor} color={color}>
        {title}
      </TitleContainer>
      <StatsContainer color={color}>{stats}</StatsContainer>
    </ReportStatsItemStyled>
  );
};

export default ReportStatsItem;

const ReportStatsItemStyled = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${(props) => props.color || '#646464'};
  min-width: 160px;
  border-radius: 0.5rem;
`;

const TitleContainer = styled('div')<{ bgColor?: string; color?: string }>`
  padding: 0.75rem 0.5rem;
  color: ${(props) => props.color || '#646464'};
  background-color: ${(props) => props.bgColor || '#F0F0F0'};
  font-weight: 600;
  text-align: center;
  font-size: 0.9rem;
  border-radius: 0.5rem 0.5rem 0 0;
  border-bottom: 1px solid ${(props) => props.color || '#646464'};
`;

const StatsContainer = styled('div')<{ color?: string }>`
  padding: 0.75rem 1rem;
  text-align: center;
  font-weight: 500;
  color: #646464;
  font-size: 1.125rem;
  overflow-wrap: anywhere;
`;
