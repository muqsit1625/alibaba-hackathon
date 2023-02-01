import { Text, View, StyleSheet } from '@react-pdf/renderer';
interface ReportStatsProps {
  title: string;
  stats: string;
  color?: string;
  bgColor?: string;
}

const ReportStatsItem = ({ title, stats, color, bgColor }: ReportStatsProps) => {
  return (
    <View
      style={{
        ...styles.ReportStatsItemStyled,
        border: 0.75,
        borderStyle: 'solid',
        borderColor: `${color ?? '#646464'}`
      }}
    >
      <View
        style={{
          ...styles.TitleContainer,
          backgroundColor: `${bgColor || '#F0F0F0'}`,
          color: `${color || '#646464'}`,
          borderBottom: 0.75,
          borderBottomStyle: 'solid',
          borderBottomColor: `${color ?? '#646464'}`
        }}
      >
        <Text>{title}</Text>
      </View>
      <View style={styles.StatsContainer}>
        <Text>{stats}</Text>
      </View>
    </View>
  );
};

export default ReportStatsItem;

const styles = StyleSheet.create({
  ReportStatsItemStyled: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 108,
    borderRadius: 8,
    marginRight: 18,
    marginBottom: 18
  },
  TitleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 9,
    paddingBottom: 9,
    paddingLeft: 6,
    paddingRight: 6,
    // padding: '9pt 6pt',
    fontWeight: 600,
    fontSize: 11,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
    // borderRadius: '6pt 6pt 0 0'
  },
  StatsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 9,
    paddingBottom: 9,
    paddingLeft: 12,
    paddingRight: 12,
    // padding: '9pt 12pt',
    fontWeight: 500,
    color: '#646464',
    fontSize: 13
  }
});
