import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2 } from "lucide-react";

interface ArticleInputProps {
  onAnalyze: (text: string, url?: string) => void;
  isLoading: boolean;
}

export const ArticleInput = ({ onAnalyze, isLoading }: ArticleInputProps) => {
  const [articleText, setArticleText] = useState("");
  const [articleUrl, setArticleUrl] = useState("");
  const [activeTab, setActiveTab] = useState("text");

  const handleSubmit = () => {
    if (activeTab === "text" && articleText.trim()) {
      onAnalyze(articleText);
    } else if (activeTab === "url" && articleUrl.trim()) {
      onAnalyze("", articleUrl);
    }
  };

  const isValid = (activeTab === "text" && articleText.trim()) || 
                  (activeTab === "url" && articleUrl.trim());

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Analyze News Article</CardTitle>
        <CardDescription>
          Paste article text or enter a URL to check for misinformation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Paste Text</TabsTrigger>
            <TabsTrigger value="url">Enter URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4">
            <Textarea
              placeholder="Paste the news article text here..."
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              className="min-h-[200px] resize-none"
              disabled={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <Input
              type="url"
              placeholder="https://example.com/article"
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Enter the URL of the article you want to analyze
            </p>
          </TabsContent>
        </Tabs>
        
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="w-full mt-4 bg-gradient-trust hover:opacity-90 transition-opacity"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Analyze Article
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
