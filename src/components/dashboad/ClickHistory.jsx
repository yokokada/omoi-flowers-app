import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import './clickcountPKF/ClickTable.css';

const ClickHistory = ({ history }) => {

    return (
        <div className='historytable'>
            <Table isHeaderSticky aria-label="Click History">
                <TableHeader>
                    <TableColumn key="clickNumber">クリックNo.</TableColumn>
                    <TableColumn key="clickedAt" >日時</TableColumn>
                    <TableColumn key="displayName" >ID</TableColumn>
                </TableHeader>
                <TableBody items={history}>
                    {(item) => (
                        <TableRow key={String(item.docId)}>
                            {(columnKey) => {
                                if (columnKey === "clickedAt") {
                                    return (
                                        <TableCell >
                                            {new Date(item.clickedAt.seconds * 1000).toLocaleString()}
                                        </TableCell>
                                    );
                                }
                                return <TableCell >{item[columnKey]}</TableCell>;
                            }}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default ClickHistory;
