import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CredibilityMeter } from "./CredibilityMeter";
import { AlertCircle, FileText } from "lucide-react";

interface AnalysisResult {
  credibilityScore: number;
  determination: "credible" | "questionable" | "fake";
  summary: string;
  explanation: string;
}

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export const AnalysisResults = ({ result }: AnalysisResultsProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CredibilityMeter 
        score={result.credibilityScore} 
        determination={result.determination}
      />
      
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Article Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-card border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Analysis & Red Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
