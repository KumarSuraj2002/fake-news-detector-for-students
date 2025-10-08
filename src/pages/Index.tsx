import { useState } from "react";
import { ArticleInput } from "@/components/ArticleInput";
import { AnalysisResults } from "@/components/AnalysisResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck, Sparkles, BookOpen } from "lucide-react";

interface AnalysisResult {
  credibilityScore: number;
  determination: "credible" | "questionable" | "fake";
  summary: string;
  explanation: string;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (text: string, url?: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-article', {
        body: { articleText: text, articleUrl: url }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast.error(error.message || 'Failed to analyze article');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing article:', error);
      toast.error('Failed to analyze article. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Analysis
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Fake News Detector
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Protect yourself from misinformation. Our AI analyzes news articles 
            to help students identify credible sources and detect fake news.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-card">
            <div className="w-12 h-12 bg-gradient-trust rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Credibility Scoring</h3>
            <p className="text-sm text-muted-foreground">
              Get a detailed credibility score from 0-100 based on multiple factors
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-card">
            <div className="w-12 h-12 bg-gradient-trust rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI examines language patterns, sources, and credibility indicators
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-card">
            <div className="w-12 h-12 bg-gradient-trust rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Educational Insights</h3>
            <p className="text-sm text-muted-foreground">
              Learn why articles are flagged and improve your media literacy
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          <ArticleInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          {result && <AnalysisResults result={result} />}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            This tool uses AI to analyze articles for credibility. Results are for educational purposes 
            and should be combined with critical thinking and additional research.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
