import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  field: {
    width: "9rem",
  },
});

const LegalInfoJP = props => {
  const { classes } = props;
  const  createRow = (name, value) => { return {name, value} };
  const rows = [
    createRow("販売事業者", "一般財団法人シンギュラリティ・ソサエティ"),    
    createRow("代表責任者", "中島聡"),    
    createRow("所在地", "〒150-0002 東京都渋谷区渋谷3丁目1-8-604"),    
    createRow("電話番号", "050-3185-8208"),    
    createRow("電話受付時間", "24時間"),    
    createRow("メアド", "info@singularitysociety.org"),    
    createRow("ウェブサイト", "https://singularitysociety.org"),    
    createRow("お支払い方法", "クレジットカード"),
    createRow("課金方法", "サロンごとの月会費を登録したクレジットカードに毎月請求します"),    
    createRow("月会費", "各サロンの課金ページをご覧ください"),    
    createRow("キャンセル", "キャンセルは各サロンの課金ページからお願いします。月額課金サービスなので月の途中での解約は出来ません。"),    
  ];
  return (
    <div>
      <Typography variant="h3" component="h2">
        特定商取引法に基づく表記
      </Typography>
      <Paper>
        <Table>
          <TableBody>
            {
              rows.map(row => {
                return (
                  <TableRow key={row.name}>
                    <TableCell className={classes.field}>{row.name}</TableCell>
                    <TableCell>{row.value}</TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
}

LegalInfoJP.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LegalInfoJP);
