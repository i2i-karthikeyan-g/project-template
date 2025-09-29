import React, { useCallback, useState } from 'react';
import { DataTable as PrimeDataTable } from 'primereact/datatable';
import type { DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { EmptyListMessage } from '../EmptyListMessage';
import './datatable.css';

export const DEFAULT_ROWS_PER_PAGE = 10;
export interface ColumnConfig<T> {
    field?: keyof T;
    header: string;
    body?: (rowData: T) => React.ReactNode;
    sortable?: boolean;
    className?: string;
    frozen?: boolean;
    alignFrozen?: 'left' | 'right';
}

export interface DataTableProps<T> {
    data: T[];
    columns: ColumnConfig<T>[];
    pagination?: boolean;
    rows?: number;
    rowsPerPageOptions?: number[];
    loading?: boolean;
    emptyMessage?: React.ReactNode;
    className?: string;
    currentPageReportTemplate?: string;
    // Server-side pagination props
    totalRecords?: number;
    lazy?: boolean;
    first?: number;
    onPage?: (event: DataTableStateEvent) => void;
    tableWrapperHeight?: string;
}


export const DataTable = <T,>({
    data,
    columns,
    pagination = true,
    rows = 10,
    rowsPerPageOptions = [5, 10, 25, 50],
    loading = false,
    emptyMessage,
    className = '',
    currentPageReportTemplate = 'Showing {first} to {last} of {totalRecords} entries',
    // Server-side pagination props
    totalRecords,
    lazy = false,
    first = 0,
    onPage,
    tableWrapperHeight = '40vh',
}: DataTableProps<T>) => {



    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-2">
            <PrimeDataTable
                value={data as any}
                rows={pagination ? rows : undefined}

                loading={loading}
                paginator={pagination}
                rowsPerPageOptions={pagination ? rowsPerPageOptions : undefined}
                className={`p-datatable-sm ${className}`}
                pt={{
                    wrapper: {
                        style: {
                            height: tableWrapperHeight,
                        }
                    }
                }}
                stripedRows={true}
                scrollable
                removableSort
                // Server-side pagination props
                lazy={lazy}
                totalRecords={totalRecords}
                first={first}
                onPage={onPage}
                paginatorTemplate={pagination ? "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" : undefined}
                currentPageReportTemplate={pagination ? currentPageReportTemplate : undefined}
                emptyMessage={emptyMessage || <EmptyListMessage text="No data found" icon="pi pi-inbox" />}

            >
                {columns.map((column, index) => (
                    <Column
                        key={(column as any).id || index}
                        field={column.field as string}
                        header={column.header}
                        body={column.body}
                        sortable={column.sortable}
                        className={column.className}
                        frozen={column.frozen}
                        alignFrozen={column.alignFrozen}
                    />
                ))}
            </PrimeDataTable>
        </div>
    );
};



export const useDataTablePagination = (initialRowsPerPage = DEFAULT_ROWS_PER_PAGE) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
    const [first, setFirst] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    const handlePageChange = useCallback((event: DataTableStateEvent) => {
        const newPage = Math.floor(event.first / event.rows) + 1;
        setFirst(event.first);
        setCurrentPage(newPage);
        setRowsPerPage(event.rows);
    }, []);

    const resetToFirstPage = useCallback(() => {
        setCurrentPage(1);
        setFirst(0);
    }, []);



    return {
        currentPage,
        rowsPerPage,
        first,
        handlePageChange,
        resetToFirstPage,
        setRowsPerPage,
        totalRecords,
        setTotalRecords
    };
};

export default DataTable; 