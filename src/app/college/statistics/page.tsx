
import { PageHeader } from "@/components/core/page-header";
import { ChartPlaceholder } from "@/components/core/chart-placeholder";
import { BarChart3 } from "lucide-react";

export default function CollegeStatisticsPage() {
  return (
    <>
      <PageHeader
        title="Recruitment Statistics"
        description="Analyze placement data, company participation, and student success rates."
      />
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ChartPlaceholder title="Overall Placement Rate Over Years" icon={BarChart3} />
        <ChartPlaceholder title="Average Salary Packages by Branch" icon={BarChart3} />
        <ChartPlaceholder title="Students Placed vs. Unplaced by Department" icon={BarChart3} />
        <ChartPlaceholder title="Company Participation Trends" icon={BarChart3} />
      </div>
    </>
  );
}
