import {
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  TableProps,
} from '@chakra-ui/react';

interface CustomTableProps extends TableProps {
  headers: string[];
  data: any[][];
}

export const Table = ({ headers, data, ...props }: CustomTableProps) => {
  return (
    <TableContainer>
      <ChakraTable variant="simple" {...props}>
        <Thead>
          <Tr>
            {headers.map((header, index) => (
              <Th key={index}>{header}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <Td key={cellIndex}>{cell}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </ChakraTable>
    </TableContainer>
  );
};
