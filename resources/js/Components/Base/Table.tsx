import { useMemo, useState, type ReactNode } from 'react';
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/cn';

type TableRootProps = {
    children: ReactNode;
    className?: string;
};

const Root = ({ children, className = '' }: TableRootProps) => {
    return <div className={cn('flex flex-col gap-4', className)}>{children}</div>;
};

type ControlsProps = {
    placeholder?: string;
    rowsPerPage: number;
    searchTerm: string;
    setRowsPerPage: (value: number) => void;
    setSearchTerm: (value: string) => void;
};

const Controls = ({
    placeholder = 'Cari...',
    rowsPerPage,
    searchTerm,
    setRowsPerPage,
    setSearchTerm,
}: ControlsProps) => {
    const showSearch = placeholder.trim().length > 0;

    return (
        <div className="flex items-center gap-3 pb-1 text-sm">
            <select
                className="rounded border border-zinc-200 bg-white px-3 py-2 text-zinc-700 outline-none focus:border-brand-yellow-dark"
                onChange={(event) => setRowsPerPage(Number(event.target.value))}
                value={rowsPerPage}
            >
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>

            {showSearch ? (
                <input
                    className="w-64 rounded border border-zinc-200 bg-white px-3 py-2 outline-none focus:border-brand-yellow-dark"
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={placeholder}
                    type="text"
                    value={searchTerm}
                />
            ) : null}
        </div>
    );
};

type ContainerProps = {
    children: ReactNode;
    className?: string;
};

const Container = ({ children, className = '' }: ContainerProps) => {
    return (
        <div className={cn('rounded border border-zinc-200 bg-white', className)}>
            <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
        </div>
    );
};

const Header = ({ children }: { children: ReactNode }) => {
    return (
        <thead>
            <tr className="h-12 bg-brand-yellow/25 text-brand-black">{children}</tr>
        </thead>
    );
};

const Body = ({ children }: { children: ReactNode }) => {
    return <tbody>{children}</tbody>;
};

const Row = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
    return (
        <tr className={cn('whitespace-nowrap border-b border-zinc-200 transition-colors hover:bg-brand-yellow/10', className)}>
            {children}
        </tr>
    );
};

type ThProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
    children: ReactNode;
    stickyRight?: boolean;
};

const Th = ({ children, className = '', stickyRight = false, ...props }: ThProps) => {
    return (
        <th
            className={cn(
                'whitespace-nowrap p-3 font-semibold text-zinc-700',
                stickyRight ? 'sticky right-0 z-20 bg-brand-yellow/25 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]' : '',
                className,
            )}
            {...props}
        >
            {children}
        </th>
    );
};

type SortHeaderProps = Omit<ThProps, 'onClick'> & {
    direction?: 'asc' | 'desc' | null;
    onToggle: () => void;
};

const SortHeader = ({ children, direction = null, onToggle, className = '', stickyRight = false, ...props }: SortHeaderProps) => {
    const ariaSort = direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';

    return (
        <Th aria-sort={ariaSort} className={className} stickyRight={stickyRight} {...props}>
            <button
                className="inline-flex w-full items-center gap-2 text-left text-inherit transition hover:text-brand-red"
                onClick={onToggle}
                type="button"
            >
                <span>{children}</span>
                {direction === 'asc' ? (
                    <ChevronUp className="h-4 w-4 shrink-0" />
                ) : direction === 'desc' ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                    <ArrowUpDown className="h-4 w-4 shrink-0 opacity-50" />
                )}
            </button>
        </Th>
    );
};

type TdProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
    children: ReactNode;
    stickyRight?: boolean;
};

const Td = ({ children, className = '', stickyRight = false, ...props }: TdProps) => {
    return (
        <td
            className={cn(
                'whitespace-nowrap px-3 py-2 text-zinc-700',
                stickyRight ? 'sticky right-0 z-10 bg-white shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.25)]' : '',
                className,
            )}
            {...props}
        >
            {children}
        </td>
    );
};

type PaginationProps = {
    page: number;
    setPage: (value: number | ((page: number) => number)) => void;
    totalPages: number;
};

const Pagination = ({ page, setPage, totalPages }: PaginationProps) => {
    return (
        <div className="flex items-center justify-end gap-3">
            <button
                className="cursor-pointer rounded border border-zinc-300 p-2 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page === 1}
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                type="button"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm text-zinc-600">
                {page} dari {totalPages}
            </span>

            <button
                className="cursor-pointer rounded border border-zinc-300 p-2 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page === totalPages}
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                type="button"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

export type DataTableColumn<TData> = {
    cell?: (row: TData, index: number) => ReactNode;
    header: ReactNode;
    key: keyof TData | string;
    searchable?: boolean;
    stickyRight?: boolean;
};

type DataTableProps<TData> = {
    columns: DataTableColumn<TData>[];
    data: TData[];
    emptyMessage?: string;
    getRowKey?: (row: TData, index: number) => string | number;
    placeholder?: string;
};

export function DataTable<TData extends Record<string, unknown>>({
    columns,
    data,
    emptyMessage = 'Tidak ada data.',
    getRowKey,
    placeholder = 'Cari...',
}: DataTableProps<TData>) {
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    const filteredData = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) {
            return data;
        }

        return data.filter((row) =>
            columns
                .filter((column) => column.searchable !== false)
                .some((column) => String(row[column.key as keyof TData] ?? '').toLowerCase().includes(keyword)),
        );
    }, [columns, data, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
    const safePage = Math.min(page, totalPages);
    const paginatedData = filteredData.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

    return (
        <Root>
            <Controls
                placeholder={placeholder}
                rowsPerPage={rowsPerPage}
                searchTerm={searchTerm}
                setRowsPerPage={(value) => {
                    setRowsPerPage(value);
                    setPage(1);
                }}
                setSearchTerm={(value) => {
                    setSearchTerm(value);
                    setPage(1);
                }}
            />
            <Container>
                <Header>
                    {columns.map((column) => (
                        <Th key={String(column.key)} stickyRight={column.stickyRight}>
                            {column.header}
                        </Th>
                    ))}
                </Header>
                <Body>
                    {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                            <Row key={getRowKey ? getRowKey(row, index) : index}>
                                {columns.map((column) => (
                                    <Td key={String(column.key)} stickyRight={column.stickyRight}>
                                        {column.cell ? column.cell(row, index) : String(row[column.key as keyof TData] ?? '-')}
                                    </Td>
                                ))}
                            </Row>
                        ))
                    ) : (
                        <Row>
                            <Td className="py-10 text-center text-zinc-500" colSpan={columns.length}>
                                {emptyMessage}
                            </Td>
                        </Row>
                    )}
                </Body>
            </Container>
            <Pagination page={safePage} setPage={setPage} totalPages={totalPages} />
        </Root>
    );
}

const Table = {
    Body,
    Container,
    Controls,
    DataTable,
    Header,
    Pagination,
    Root,
    Row,
    SortHeader,
    Td,
    Th,
};

export default Table;
