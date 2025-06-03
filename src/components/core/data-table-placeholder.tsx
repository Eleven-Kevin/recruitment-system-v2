import { Table, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataTablePlaceholderProps {
  title?: string;
  message?: string;
  icon?: React.ElementType;
}

export function DataTablePlaceholder({
  title = "Data Table",
  message = "No data available yet, or this feature is under construction.",
  icon: Icon = Table,
}: DataTablePlaceholderProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center min-h-[200px] text-center">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
