import type { BarWithUser } from "@shared/schema";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { formatTimestamp } from "@/lib/formatDate";

interface BarCardProps {
  bar: BarWithUser;
}

export default function BarCard({ bar }: BarCardProps) {
  // Simple function to convert basic HTML tags to React elements for safety
  // In a real app, use a sanitizer library like dompurify
  const createMarkup = (html: string) => {
    return { __html: html };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-colors duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarImage src={bar.user.avatarUrl || undefined} alt={bar.user.username} />
              <AvatarFallback>{bar.user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm hover:text-primary cursor-pointer" data-testid={`text-author-${bar.id}`}>
                  @{bar.user.username}
                </span>
                {bar.user.membershipTier !== "free" && (
                  <span className="text-[10px] text-primary">✓</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground" data-testid={`text-timestamp-${bar.id}`}>
                {formatTimestamp(bar.createdAt)}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" data-testid={`button-more-${bar.id}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="relative pl-4 border-l-2 border-primary/50 py-1">
            <p 
              className="font-mono text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-foreground/90 [&>b]:text-primary [&>b]:font-black [&>i]:text-primary/80 [&>u]:decoration-primary [&>u]:decoration-2 [&>u]:underline-offset-4"
              data-testid={`text-content-${bar.id}`}
              dangerouslySetInnerHTML={createMarkup(bar.content)}
            />
          </div>
          
          {bar.explanation && (
            <div className="bg-secondary/30 p-3 rounded-md text-sm text-muted-foreground italic" data-testid={`text-explanation-${bar.id}`}>
              <span className="font-bold text-primary/80 not-italic mr-2">Entendre:</span>
              {bar.explanation}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline" className="border-primary/20 text-primary/80 hover:bg-primary/10" data-testid={`badge-category-${bar.id}`}>
              {bar.category}
            </Badge>
            {bar.tags && bar.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs text-muted-foreground" data-testid={`badge-tag-${tag}-${bar.id}`}>
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="border-t border-white/5 py-3">
          <div className="flex w-full items-center justify-between text-muted-foreground">
            <Button variant="ghost" size="sm" className="gap-2 hover:text-red-500 hover:bg-red-500/10 transition-colors" data-testid={`button-like-${bar.id}`}>
              <Heart className="h-4 w-4" />
              <span className="text-xs">0</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2 hover:text-blue-400 hover:bg-blue-400/10 transition-colors" data-testid={`button-comment-${bar.id}`}>
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">0</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2 hover:text-primary hover:bg-primary/10 transition-colors" data-testid={`button-share-${bar.id}`}>
              <Share2 className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
