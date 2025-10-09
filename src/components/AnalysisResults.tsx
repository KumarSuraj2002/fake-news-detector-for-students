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
      <div className="animate-in scale-in duration-300">
        <CredibilityMeter 
          score={result.credibilityScore} 
          determination={result.determination}
        />
      </div>
      
      <Card className="shadow-card border border-primary/20 bg-gradient-to-br from-background to-muted/20 hover-scale transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            Article Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90 leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-card border-l-4 border-l-primary bg-gradient-to-br from-background to-accent/5 hover-scale transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            Analysis & Red Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
