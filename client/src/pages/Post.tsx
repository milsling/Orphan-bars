import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/mockData";
import { ArrowLeft, Bold, Italic, Underline } from "lucide-react";
import { Link } from "wouter";
import { useRef } from "react";

export default function Post() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    // Simple toggle logic could be added here, but for now just wrapping
    const newText = text.substring(0, start) + `<${tag}>` + selectedText + `</${tag}>` + text.substring(end);
    
    // React state update would be better in a real app, but direct manipulation works for prototype speed
    textarea.value = newText;
    textarea.focus();
    textarea.setSelectionRange(start + tag.length + 2, end + tag.length + 2);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-16">
      <Navigation />
      
      <main className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-display font-bold">Drop a Bar</h1>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-lg">The Bars</Label>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
                    onClick={() => insertFormat('b')}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
                    onClick={() => insertFormat('i')}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
                    onClick={() => insertFormat('u')}
                    title="Underline"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea 
                ref={textareaRef}
                id="content" 
                placeholder="Type your lyrics here... Use line breaks for flow." 
                className="min-h-[150px] bg-secondary/50 border-border/50 font-mono text-lg focus:border-primary resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Highlight text and click formatting buttons to style your bars.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation / Context (Optional)</Label>
              <Textarea 
                id="explanation" 
                placeholder="Break down the entendre, metaphor, or context..." 
                className="min-h-[80px] bg-secondary/30 border-border/50 text-sm focus:border-primary resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger className="bg-secondary/30 border-border/50">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input 
                  id="tags" 
                  placeholder="e.g. funny, freestyle, diss" 
                  className="bg-secondary/30 border-border/50"
                />
              </div>
            </div>

            <Button className="w-full text-lg font-bold py-6 bg-primary text-primary-foreground hover:bg-primary/90 mt-4">
              Post to Orphan Bars
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
