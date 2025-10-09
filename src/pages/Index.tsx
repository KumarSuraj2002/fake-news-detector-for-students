import { useState, useRef } from "react";
import { ArticleInput } from "@/components/ArticleInput";
import { AnalysisResults } from "@/components/AnalysisResults";
import { toast } from "sonner";
import { ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { pipeline } from "@huggingface/transformers";

interface AnalysisResult {
  credibilityScore: number;
  determination: "credible" | "questionable" | "fake";
  summary: string;
  explanation: string;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const classifierRef = useRef<any>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  const handleAnalyze = async (text: string, url?: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      // Initialize model only once and cache it
      if (!classifierRef.current) {
        toast.info('Loading AI model... This will only happen once.');
        classifierRef.current = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
        setModelLoaded(true);
        toast.success('Model loaded! Analysis will be faster now.');
      } else {
        toast.info('Analyzing article...');
      }
      
      // Analyze the text using cached classifier
      const sentimentResult: any = await classifierRef.current(text.slice(0, 512)); // Limit to 512 tokens
      const sentiment = Array.isArray(sentimentResult) ? sentimentResult[0] : sentimentResult;
      
      // Calculate credibility score based on various factors
      let credibilityScore = 50; // Start neutral
      let redFlags: string[] = [];
      let positiveIndicators: string[] = [];
      
      // Check for emotional/sensational language
      if (sentiment.label === 'NEGATIVE' && sentiment.score > 0.9) {
        credibilityScore -= 20;
        redFlags.push('Highly emotional or negative language detected');
      }
      
      // Check for all caps (sensationalism)
      const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
      if (capsRatio > 0.3) {
        credibilityScore -= 15;
        redFlags.push('Excessive use of capital letters (sensationalism indicator)');
      }
      
      // Check for exclamation marks (sensationalism)
      const exclamationCount = (text.match(/!/g) || []).length;
      if (exclamationCount > 5) {
        credibilityScore -= 10;
        redFlags.push('Excessive use of exclamation marks');
      }
      
      // Check for source citations
      const hasSources = /source:|according to|study|research|report/i.test(text);
      if (hasSources) {
        credibilityScore += 15;
        positiveIndicators.push('Contains references to sources or research');
      } else {
        redFlags.push('No clear citations or source references found');
      }
      
      // Check article length (too short might be unreliable)
      if (text.length < 200) {
        credibilityScore -= 10;
        redFlags.push('Article is very short, may lack sufficient detail');
      } else if (text.length > 500) {
        credibilityScore += 10;
        positiveIndicators.push('Substantial content with adequate detail');
      }
      
      // Check for clickbait phrases
      const clickbaitPhrases = /you won't believe|shocking|doctors hate|one weird trick|what happens next/i;
      if (clickbaitPhrases.test(text)) {
        credibilityScore -= 20;
        redFlags.push('Contains clickbait-style language');
      }
      
      // Ensure score is between 0 and 100
      credibilityScore = Math.max(0, Math.min(100, credibilityScore));
      
      // Determine credibility level
      let determination: "credible" | "questionable" | "fake";
      if (credibilityScore >= 61) {
        determination = "credible";
      } else if (credibilityScore >= 31) {
        determination = "questionable";
      } else {
        determination = "fake";
      }
      
      // Generate a more intelligent summary based on the analysis
      const wordCount = text.split(' ').length;
      const avgWordLength = text.replace(/\s/g, '').length / wordCount;
      const summary = `This ${wordCount}-word article ${
        determination === 'credible' ? 'appears to be relatively credible' :
        determination === 'questionable' ? 'raises some credibility concerns' :
        'shows significant credibility issues'
      }. Sentiment: ${sentiment.label}. ${
        hasSources ? 'Contains source references.' : 'Lacks clear citations.'
      } ${
        redFlags.length > 2 ? 'Multiple red flags detected.' : 
        redFlags.length > 0 ? 'Some concerns identified.' : 
        'No major red flags found.'
      }`;
      
      // Generate explanation
      let explanation = '**Analysis Results:**\n\n';
      
      if (redFlags.length > 0) {
        explanation += '**Red Flags Detected:**\n';
        redFlags.forEach(flag => {
          explanation += `• ${flag}\n`;
        });
        explanation += '\n';
      }
      
      if (positiveIndicators.length > 0) {
        explanation += '**Positive Indicators:**\n';
        positiveIndicators.forEach(indicator => {
          explanation += `• ${indicator}\n`;
        });
        explanation += '\n';
      }
      
      explanation += `**Sentiment Analysis:** ${sentiment.label} (${(sentiment.score * 100).toFixed(1)}% confidence)\n\n`;
      explanation += '**Recommendation:** ';
      
      if (determination === 'credible') {
        explanation += 'This article shows signs of credibility, but always verify with multiple sources.';
      } else if (determination === 'questionable') {
        explanation += 'Exercise caution. Cross-reference this information with trusted news sources.';
      } else {
        explanation += 'This article shows multiple red flags. Verify information before sharing or believing it.';
      }

      setResult({
        credibilityScore,
        determination,
        summary,
        explanation
      });
      
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
