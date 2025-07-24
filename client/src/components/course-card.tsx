import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, MessageCircle, Share2, ShoppingCart, Star, TrendingUp, Award, Users, Calendar, ChevronRight, Sparkles, Clock, ExternalLink, Copy, CheckCircle, Youtube, Instagram, Facebook, Play, Shield, AlertTriangle, DollarSign, User, Send, X, Zap } from "lucide-react";
import { Channel } from "@/types/course";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ChannelCardProps {
  channel: Channel;
  onBuyNow: (channel: Channel) => void;
}

// Backward compatibility
interface CourseCardProps {
  channel: Channel;
  onBuyNow: (channel: Channel) => void;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date | string;
  avatar: string;
}

// Auto thumbnail generator function
const getAutoThumbnail = (category: string, serviceType: string) => {
  const thumbnailCategories = {
    'Tech & Technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
    'Cooking & Food': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop',
    'Entertainment': 'https://images.unsplash.com/photo-1489599687944-2d4b76d5e7b3?w=400&h=200&fit=crop',
    'Fun & Comedy': 'https://images.unsplash.com/photo-1517702087094-af3b692b3db5?w=400&h=200&fit=crop',
    'Gaming': 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=200&fit=crop',
    'Health & Fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
    'Lifestyle': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop',
    'Travel': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop',
    'Education': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop',
    'Music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
    'Sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
    'Fashion & Beauty': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=200&fit=crop',
    'Business & Finance': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
    'DIY & Crafts': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=200&fit=crop',
    'News & Politics': 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=400&h=200&fit=crop',
    'Science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=200&fit=crop',
    'Art & Design': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop',
    'Photography': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=200&fit=crop',
    'Cars & Automotive': 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&h=200&fit=crop',
    'Pets & Animals': 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400&h=200&fit=crop',
    'History & Culture': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop',
    'Spirituality': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop'
  };

  // Service type specific thumbnails
  const serviceTypeThumbnails = {
    'youtube': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop',
    'instagram': 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=200&fit=crop',
    'tiktok': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=200&fit=crop',
    'telegram': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop',
    'discord': 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=200&fit=crop',
    'reels': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop',
    'video': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=200&fit=crop',
    'tools': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
    'other': 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop'
  };

  // First priority: category-specific thumbnail
  if (category && thumbnailCategories[category as keyof typeof thumbnailCategories]) {
    return thumbnailCategories[category as keyof typeof thumbnailCategories];
  }

  // Second priority: service type specific thumbnail
  if (serviceType && serviceTypeThumbnails[serviceType as keyof typeof serviceTypeThumbnails]) {
    return serviceTypeThumbnails[serviceType as keyof typeof serviceTypeThumbnails];
  }

  // Default fallback
  return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop';
};

export function ChannelCard({ channel, onBuyNow }: ChannelCardProps) {
  // Backward compatibility support
  const channelData = channel;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(channelData.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [realTimeViews] = useState(channelData.views || Math.floor(Math.random() * 9000) + 1000);
  const [realTimeSales] = useState(channelData.sales || 0);
  const [realTimeRating] = useState(channelData.rating || (Math.random() * 3.9 + 1.1).toFixed(1));
  const [followerCount] = useState(channelData.followerCount || Math.floor(Math.random() * 100000) + 10000);
  const [engagementRate] = useState(channelData.engagementRate || (Math.random() * 8 + 2).toFixed(1));
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentsView, setShowCommentsView] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Realistic mixed names with 80% Indian names
  const generateRealisticComments = () => {
    const indianNames = [
      "Rajesh Kumar", "Priya Sharma", "Anita Patel", "Sunita Singh", "Kavya Reddy",
      "Neha Gupta", "Ravi Agarwal", "Sanjay Mishra", "Vikram Singh", "Rahul Jain",
      "Arjun Nair", "Kiran Kumar", "Amit Verma", "Deepika Singh", "Rohit Gupta",
      "Sneha Patel", "Manish Kumar", "Pooja Sharma", "Aakash Jain", "Shreya Reddy",
      "Varun Singh", "Meera Gupta", "Harsh Agarwal", "Nisha Patel", "Kunal Sharma",
      "Vikas Yadav", "Shweta Agarwal", "Mohit Bansal", "Ritu Singh", "Arpit Joshi"
    ];

    const internationalNames = [
      "Jennifer Smith", "Michael Johnson", "David Wilson", "Robert Brown", "James Davis",
      "Christopher Lee", "Emily Garcia", "Jessica Miller", "Sarah Anderson", "Amanda Taylor",
      "Maria Rodriguez", "Lisa Thomas", "Alex Thompson", "Sophie Turner", "Chris Evans"
    ];

    // Category and Service Type specific comments
    const categoryComments = {
      // YouTube specific comments
      youtube: [
        "YouTube channel fully monetized mil gaya bhai! AdSense earning start", "Subscribers growth exponential hai, 1K se 50K in months",
        "YouTube algorithm perfectly favor kar raha hai content", "Watch hours aur CPM rates both amazing hain yahan",
        "Content quality professional level hai, editing top notch", "Viral potential unlimited hai, trending videos regularly",
        "Monetization requirements already complete, earning ready", "Analytics dashboard mein sab green signals show kar raha",
        "Thumbnail aur SEO strategy perfectly optimized hai", "Algorithm friendly content strategy implemented successfully",
        "YouTube Studio mein complete professional setup done", "Community tab engagement aur subscriber retention excellent",
        "Shorts aur long form content both performing great", "Copyright strike free, clean channel history maintained",
        "Niche authority established, brand partnerships incoming", "Revenue streams multiple, affiliate marketing ready",
        "Video consistency maintained, upload schedule perfect", "Audience demographics valuable for advertisers targeting"
      ],

      // Instagram specific comments  
      instagram: [
        "Instagram account ka engagement rate dekh ke pagal ho gaya! Like aur comments solid", "Story views aur reach kamaal ka hai, organic traffic hai",
        "Reels viral hone ka potential 1000%, algorithm favor kar raha", "Brand collaboration ready audience hai, demographics perfect",
        "Blue tick verification ke liye eligible hai account", "Story highlights professionally managed hain with covers",
        "IGTV aur long form content bhi bohot engaging hai", "Followers quality check kar liya, real active users hain",
        "Niche authority account hai, followers trust kar rahe", "Influencer marketing ke liye perfect setup hai bio mein",
        "Bio link aur contact info properly optimized hai", "Grid aesthetic bilkul on point hai, theme consistent",
        "Live streaming engagement bhi solid hai audience interactive", "Shopping tags aur business features properly enabled",
        "Hashtag research aur strategy top notch hai", "Content calendar consistent posting schedule maintain",
        "Analytics metrics strong growth trend show kar rahe", "Cross-platform promotion strategy effective hai yahan"
      ],

      // Tech & Technology comments
      'Tech & Technology': [
        "Tech reviews bilkul professional level ke hain! 💻", "Latest gadgets ka coverage amazing hai",
        "Coding tutorials bohot helpful hain yaar", "AI aur ML content ka demand high hai",
        "Software reviews unbiased aur detailed hain", "Tech news ki coverage timely aur accurate",
        "Programming tutorials beginner-friendly hain", "Hardware reviews mein technical depth hai",
        "Startup aur tech industry insights valuable hain", "Cybersecurity content bohot relevant hai",
        "Mobile tech aur app reviews top notch", "Cloud computing content ka demand growing hai",
        "Data science tutorials practical aur useful hain", "Tech career guidance content helpful hai"
      ],

      // Cooking & Food comments
      'Cooking & Food': [
        "Recipes try kiye, sabko bohot pasand aaye! 🍛", "Indian cuisine ka presentation world-class hai",
        "Step-by-step cooking videos crystal clear hain", "Healthy recipes ka collection amazing hai",
        "Regional dishes ka authentic taste capture kiya", "Food photography aur videography top level",
        "Quick recipes working professionals ke liye perfect", "Traditional recipes modern twist ke saath",
        "Vegetarian options ka variety bohot wide hai", "Street food recipes ghar mein try kar sakte hain",
        "Baking tutorials beginner se expert level tak", "Nutrition information properly mentioned hai",
        "Food styling aur presentation tips valuable hain", "Festival special recipes ka timing perfect hai"
      ],

      // Gaming comments
      Gaming: [
        "Gaming skills dekh ke inspired ho gaya! 🎮", "Live streaming quality professional level ki hai",
        "Game reviews honest aur detailed hain", "Esports tournament coverage exciting hai",
        "Gaming tips aur tricks bohot helpful hain", "New game launches ka coverage timely hai",
        "Gaming setup aur gear reviews useful hain", "Multiplayer sessions mein community active hai",
        "Game walkthroughs clear aur comprehensive hain", "Gaming news aur updates regular milte hain",
        "Retro gaming content nostalgic aur fun hai", "Mobile gaming ka coverage bhi solid hai",
        "Gaming tutorials beginner-friendly approach hai", "Speedrun videos aur challenges entertaining hain"
      ],

      // Telegram specific comments
      telegram: [
        "Telegram channel ka subscriber base massive hai! Content quality top", "Daily active members engagement consistently high level maintain",
        "Instant updates aur breaking news rapid delivery system", "File sharing unlimited resources treasure trove for users",
        "Admin team response lightning fast 24/7 support available", "Organic growth steady hai without fake subscribers issue",
        "Content perfectly categorized with clear channel organization", "Premium exclusive content access with commercial value",
        "Broadcasting reach global audience multiple language support", "Interactive polls aur community engagement features active",
        "Educational content university level quality maintained consistently", "Business networking opportunities through channel community hub",
        "Technical support aur troubleshooting immediate response guaranteed", "Content range beginner to expert level comprehensive coverage",
        "Monetization ready channel with affiliate marketing potential", "Channel analytics strong performance metrics showing growth"
      ],

      // Discord specific comments  
      discord: [
        "Discord server ka community vibe amazing! 💬", "Voice chat sessions bohot interactive hain",
        "Gaming tournaments aur events regular organize hote", "Moderators active aur helpful hain 24/7",
        "Different channels perfectly categorized hain", "Bot features aur commands useful hain",
        "Server rules clear aur fairly enforced hain", "New member onboarding process smooth hai",
        "Discussion quality intellectual aur engaging hai", "File sharing aur collaboration easy hai",
        "Custom emojis aur server branding creative hai", "Role system aur permissions well-managed hain",
        "Community challenges aur competitions fun hain", "Knowledge sharing aur learning environment positive"
      ],

      // Video Bundle comments  
      video: [
        "Video bundle ka content variety incredible hai! Multiple niches covered", "Production quality Hollywood level ka hai with professional equipment",
        "Editing aur effects professionally done hain with motion graphics", "Video length aur pacing perfect hai, audience retention high",
        "Multiple format videos included - reels, long form, shorts", "HD/4K quality mein sab videos crystal clear rendering",
        "Tutorial series step-by-step clear explanation with graphics", "Entertainment content family-friendly aur brand safe hai",
        "Video SEO optimization aur thumbnails click-worthy design", "Series format mein content strategically organized hai",
        "Exclusive footage aur behind-the-scenes content included", "Video performance metrics consistently strong trending",
        "Content calendar planned release schedule maintained", "Bulk video package saves time aur editing cost",
        "Ready-to-upload format with descriptions aur tags", "Commercial rights included for business use cases"
      ],

      // Tools specific comments
      tools: [
        "Digital tools ka collection game-changer hai! 🛠️", "Automation tools productivity 10x increase karte",
        "User interface clean aur intuitive hai", "Tool documentation comprehensive aur helpful hai",
        "Regular updates aur feature additions milte rehte", "Customer support responsive aur knowledgeable hai",
        "Integration capabilities other tools ke saath smooth", "Cost-effective solution multiple problems ka",
        "Learning curve minimal, easy to implement hai", "Performance metrics aur analytics detailed hain",
        "Custom configuration options flexible hain", "Security features robust aur reliable hain",
        "Scalability options business growth ke saath adjust", "Training materials aur tutorials comprehensive hain"
      ],

      // Entertainment comments
      Entertainment: [
        "Comedy content has me rolling! 😂", "Entertainment value paisa vasool hai completely",
        "Memes aur viral content ka timing perfect", "Celebrity interviews aur gossip interesting hain",
        "Movie reviews unbiased aur helpful hain", "Music covers aur original content dono solid",
        "Stand-up comedy clips hilarious hain yaar", "Trending topics ka coverage fresh perspective ke saath",
        "Web series reviews aur recommendations spot on", "Behind-the-scenes content exclusive aur engaging",
        "Live entertainment shows ka production quality high", "Pop culture references relatable aur funny hain",
        "Reaction videos genuine aur entertaining hain", "Celebrity interactions authentic aur fun hain"
      ],

      // TikTok specific comments
      tiktok: [
        "TikTok account ka engagement rate dekh ke pagal ho gaya! Views lakhs mein", "Viral content ka potential 1000% hai yaar",
        "FYP algorithm perfectly optimized hai, har video trending", "Hashtag strategy bohot strong hai aur viral sounds use kiye",
        "Dance trends aur challenges follow karne wala content", "Music sync aur timing perfect hai har video mein",
        "Gen Z audience ka favorite account hai completely", "Brand partnerships ke liye ready audience available",
        "Content creation quality professional level ka hai", "Follower growth exponential curve mein badh raha",
        "Video editing skills next level hain with transitions", "Trending sounds ka proper use kiya gaya hai",
        "Creative concepts unique aur catchy hain bilkul", "Short form content ka raja hai ye account bro",
        "Duet aur collaboration potential unlimited hai", "For You Page mein regular feature hota rehta"
      ],

      // Default comments for other categories
      default: [
        "Content quality dekh ke impress ho gaya! ⭐", "Engagement rate bilkul solid hai bro",
        "Audience response bohot positive hai", "Growth potential unlimited hai isme",
        "Value for money ka perfect example", "Professional management clearly visible hai",
        "Consistent posting schedule maintain kiya hai", "Community building excellent hai",
        "Brand value aur reputation strong hai", "Market mein demand high hai is type ka content",
        "Target audience perfectly aligned hai", "Monetization opportunities multiple hain",
        "Content strategy well-planned aur executed", "Competition se clearly ahead hai ye channel"
      ]
    };

    const internationalComments = [
      "This channel transformed my business completely! 🚀", "Content quality is absolutely phenomenal",
      "Engagement metrics are off the charts!", "Best investment I've made this year",
      "Professional management clearly shows results", "Audience quality is premium level",
      "Growth potential is absolutely unlimited here", "ROI exceeded all my expectations",
      "Content strategy is brilliantly executed", "Market positioning is perfect for growth",
      "Brand value keeps increasing consistently", "Community engagement is incredibly strong",
      "Monetization opportunities are endless", "Competition analysis shows clear advantages"
    ];

    const timeStamps = [
      "अभी अभी", "2 min ago", "15 min ago", "1 घंटा ago", "3 hours ago",
      "5 घंटे ago", "1 दिन ago", "2 days ago", "3 दिन ago", "1 हफ्ता ago"
    ];

    // Smart comment selection based on category and service type
    const getRelevantComments = () => {
      const serviceType = channelData.serviceType || '';
      const category = channelData.category || '';

      // Priority: Service type > Category > Default
      if (serviceType && (categoryComments as any)[serviceType]) {
        return (categoryComments as any)[serviceType];
      } else if (category && (categoryComments as any)[category]) {
        return (categoryComments as any)[category];
      } else {
        return categoryComments.default;
      }
    };

    const relevantComments = getRelevantComments();
    const count = Math.floor(Math.random() * 25) + 5; // 5-30 comments
    const generatedComments = [];

    for (let i = 0; i < count; i++) {
      const isIndian = Math.random() < 0.8; // 80% Indian comments
      const name = isIndian ? 
        indianNames[Math.floor(Math.random() * indianNames.length)] :
        internationalNames[Math.floor(Math.random() * internationalNames.length)];

      // Use relevant comments for Indians, international for others
      const comment = isIndian ?
        relevantComments[Math.floor(Math.random() * relevantComments.length)] :
        internationalComments[Math.floor(Math.random() * internationalComments.length)];

      generatedComments.push({
        id: `auto_${i}`,
        user: name,
        text: comment,
        timestamp: timeStamps[Math.floor(Math.random() * timeStamps.length)],
        avatar: name.split(' ').map(n => n[0]).join('')
      });
    }

    setComments(generatedComments);
    setCommentCount(count);

    // Store comments in localStorage to prevent regeneration
    localStorage.setItem(`comments_${channelData.id}`, JSON.stringify(generatedComments));
  };

  useEffect(() => {
    // Check if user has liked this channel before
    const savedLikeState = localStorage.getItem(`liked_${channelData.id}`);
    if (savedLikeState) {
      setIsLiked(savedLikeState === 'true');
    }

    // Generate comments only once and store in localStorage
    const savedComments = localStorage.getItem(`comments_${channelData.id}`);
    if (savedComments) {
      const parsedComments = JSON.parse(savedComments);
      setComments(parsedComments);
      setCommentCount(parsedComments.length);
    } else {
      generateRealisticComments();
    }
  }, [channelData.id]);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 300) { // 5 minutes
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min ago`;
    } else {
      return "5 min ago";
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to like channels",
        variant: "destructive",
      });
      return;
    }

    try {
      const newLikedState = !isLiked;
      const newLikesCount = newLikedState ? likes + 1 : likes - 1;

      setIsLiked(newLikedState);
      setLikes(newLikesCount);

      // Store like state in localStorage to persist across refreshes
      localStorage.setItem(`liked_${channelData.id}`, newLikedState.toString());

      // Update Firebase database with real-time like count
      const { ref, update } = await import("firebase/database");
      const { database } = await import("@/lib/firebase");

      await update(ref(database, `channels/${channelData.id}`), {
        likes: newLikesCount
      });

      toast({
        title: newLikedState ? "Added to likes!" : "Removed from likes",
        description: newLikedState ? "Channel added to your likes" : "Channel removed from your likes",
      });
    } catch (error) {
      console.error("Error liking channel:", error);
      toast({
        title: "Error",
        description: "Failed to like channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/channel/${channelData.id}?ref=${user?.uid || 'guest'}`;
      const shareData = {
        title: channelData.title,
        text: `Check out this amazing channel: ${channelData.title} - Only ₹${channelData.price}`,
        url: shareUrl,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (shareError: any) {
          // Silently handle share cancellation
          if (shareError.name === 'AbortError' || shareError.message === 'Share canceled' || shareError.message?.includes('cancel')) {
            console.log('Share cancelled by user');
            return;
          }
          // For actual errors, fallback to copy
          throw shareError;
        }
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "Channel link has been copied to clipboard with your referral code",
        });
      }
    } catch (error: any) {
      // Only show fallback for non-cancellation errors
      if (error.name !== 'AbortError' && !error.message?.includes('cancel')) {
        // Fallback for when share fails
        const shareUrl = `${window.location.origin}/channel/${channelData.id}?ref=${user?.uid || 'guest'}`;
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link Copied!", 
            description: "Channel link has been copied to clipboard",
          });
        } catch (clipboardError) {
          toast({
            title: "Share Ready!",
            description: "Use the share button to share this channel",
          });
        }
      }
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: user?.displayName || user?.email || "Anonymous",
      text: newComment,
      timestamp: new Date(),
      avatar: (user?.displayName || user?.email || "A").charAt(0).toUpperCase()
    };

    setComments(prev => [comment, ...prev]);
    setNewComment("");

    toast({
      title: "Comment Added!",
      description: "Your comment has been posted successfully",
    });
  };

    const handleComment = async () => {
    if (!comment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      user: user?.displayName || user?.email || "Anonymous",
      text: comment,
      timestamp: new Date(),
      avatar: (user?.displayName || user?.email || "A").charAt(0).toUpperCase()
    };

    const updatedComments = [newCommentObj, ...comments];
    setComments(updatedComments);
    setCommentCount(updatedComments.length);
    setComment("");
    setShowCommentDialog(false);

    try {
      // Save to Firebase Database in real-time
      const { ref, push, set } = await import("firebase/database");
      const { database } = await import("@/lib/firebase");

      const commentsRef = ref(database, `comments/${channelData.id}`);
      const newCommentRef = push(commentsRef);

      await set(newCommentRef, {
        ...newCommentObj,
        userId: user?.uid,
        channelId: channelData.id,
        isVerified: true, // Real user comment
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Also update channel's comment count in Firebase
      const { update } = await import("firebase/database");
      const channelRef = ref(database, `channels/${channelData.id}`);
      await update(channelRef, {
        comments: updatedComments.length,
        lastCommentAt: new Date().toISOString()
      });

      console.log('Real user comment saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving comment to Firebase:', error);
    }

    // Store updated comments in localStorage as backup
    localStorage.setItem(`comments_${channelData.id}`, JSON.stringify(updatedComments));

    toast({
      title: "Comment Added! 🎉",
      description: "आपका comment successfully post हो गया है",
    });
  };

  // Calculate automatic discount percentage if fake price exists
  const calculateDiscountPercentage = () => {
    if (channelData.fakePrice && channelData.fakePrice > channelData.price) {
      return Math.round(((channelData.fakePrice - channelData.price) / channelData.fakePrice) * 100);
    }
    return channelData.discount || 0;
  };

  const discountPercentage = calculateDiscountPercentage();
  const discountedPrice = channelData.finalPrice || (channelData.discount ? channelData.price - (channelData.price * channelData.discount / 100) : channelData.price);

  // Use real-time data with consistent values (no random regeneration)
  const displayLikes = likes; // Use real-time likes from state
  const displaySales = realTimeSales; // Use consistent sales value
  const displayViews = realTimeViews; // Use consistent views value
  const displayRating = parseFloat(realTimeRating.toString()); // Ensure rating is between 1.1 and 5.0
  const finalRating = Math.min(Math.max(displayRating, 1.1), 5.0);

  // Get service type specific follower label
  const getFollowerLabel = (serviceType: string) => {
    switch(serviceType) {
      case 'youtube': return 'Subscribers';
      case 'instagram': return 'Followers';
      case 'facebook': return 'Followers'; 
      case 'telegram': return 'Members';
      case 'reels': return 'Followers';
      case 'video': return 'Followers';
      case 'tools': return 'Users';
      default: return 'Followers';
    }
  };

  // Get strike color and text
  const getStrikeInfo = (reputation: string) => {
    switch(reputation) {
      case 'new': return { color: 'bg-green-500', text: '0 Strikes', textColor: 'text-green-700' };
      case '1_strike': return { color: 'bg-yellow-500', text: '1 Strike', textColor: 'text-yellow-700' };
      case '2_strikes': return { color: 'bg-orange-500', text: '2 Strikes', textColor: 'text-orange-700' };
      case '3_strikes': return { color: 'bg-red-500', text: '3 Strikes', textColor: 'text-red-700' };
      default: return { color: 'bg-gray-500', text: 'Unknown', textColor: 'text-gray-700' };
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${Math.floor(views / 1000000)}M`;
    if (views >= 1000) return `${Math.floor(views / 1000)}K`;
    return views.toString();
  };

    return (
    <div className="relative w-full bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      {/* Sold Out Glassmorphism Overlay - Only on sold out cards */}
      {channelData.soldOut && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-bold shadow-lg">
              SOLD OUT
            </div>
          </div>
        </div>
      )}

      {/* Image Section - Increased height for better scale */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={channelData.thumbnail || getAutoThumbnail(channelData.category || '', channelData.serviceType || '')}
          alt={channelData.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-30 duration-300"
          onError={(e) => {
            // If image fails to load, use category-based fallback
            const target = e.target as HTMLImageElement;
            target.src = getAutoThumbnail(channelData.category || '', channelData.serviceType || '');
          }}
        />

        {/* Discount Badge - Top Left */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Platform Badge - Top Right (only if platform exists) */}
        {channelData.platform && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold">
            {channelData.platform === 'youtube' ? 'Youtube' : 
             channelData.platform === 'instagram' ? 'Instagram' :
             channelData.platform === 'facebook' ? 'Facebook' :
             channelData.platform === 'tiktok' ? 'TikTok' :
             channelData.platform === 'twitter' ? 'Twitter' :
             channelData.platform === 'linkedin' ? 'LinkedIn' :
             channelData.platform === 'telegram' ? 'Telegram' : channelData.platform}
          </div>
        )}

        {/* Service Type Badge - Bottom Left (only if provided by user) */}
        {channelData.serviceType && (
          <div className="absolute bottom-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-bold">
            {channelData.serviceType}
          </div>
        )}

        {/* Category Badge - Bottom Center (only if provided by user) */}
        {channelData.category && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            {channelData.category}
          </div>
        )}

        {/* Monetized Badge - Top Left (if monetized) */}
        {channelData.monetizationStatus === 'monetized' && (
          <div className="absolute top-12 left-3 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-bold">
            Monetized
          </div>
        )}

        {/* PRO SELLER Badge - Bottom Right */}
        {channelData.bonusBadge && (
          <div className="absolute bottom-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-bold">
            PRO SELLER
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title and PRO Badge */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {channelData.title}
          </h3>
          {channelData.bonusBadge && (
            <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-bold ml-2 flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" />
              PRO
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 text-sm">
            By: <span className="font-semibold text-gray-900">{channelData.seller || 'user name'}</span>
          </span>
        </div>

        {/* Description */}
        <div className="text-gray-600 text-sm mb-4 leading-relaxed">
          <p className={`${!showFullDescription ? 'line-clamp-2' : ''}`}>
            {channelData.description}
          </p>
          {channelData.description && channelData.description.length > 100 && (
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-purple-600 hover:text-purple-800 cursor-pointer ml-1 font-medium transition-colors"
            >
              {showFullDescription ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-green-600">₹{channelData.price.toLocaleString()}</span>
          {channelData.fakePrice && channelData.fakePrice > channelData.price && (
            <>
              <span className="text-gray-500 line-through">₹{channelData.fakePrice.toLocaleString()}</span>
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {discountPercentage}% OFF
              </div>
            </>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{finalRating}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{displayLikes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{commentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{formatViews(displayViews)}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" />
            <span>{realTimeSales} sold</span>
          </div>
        </div>

        {/* Buy Now Button */}
        <Button 
          onClick={() => {
            if (channelData.soldOut) {
              toast({
                title: "Service Sold Out",
                description: "This service is sold out. Please explore other options.",
                variant: "destructive",
              });
              return;
            }
            onBuyNow(channelData);
          }}
          disabled={channelData.soldOut}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mb-4"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Buy Now - ₹{channelData.price.toLocaleString()}
        </Button>

        {/* Action Buttons Row */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleLike}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            Like
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCommentsView(true)}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Comments ({commentCount})
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>

        {/* Trust Badge - Only show if admin has given badge */}
        {channelData.bonusBadge && (
          <div className="mt-4 text-center">
            <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
              This is 100% Trusted Seller ✓ Verified By Admin Received Trusted Badge
            </span>
          </div>
        )}
      </div>

      {/* Comments View Modal */}
      {showCommentsView && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-visible flex flex-col">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Comments ({commentCount})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentsView(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {comment.avatar}
                    </div>
                    <span className="font-semibold text-gray-900">{comment.user}</span>
                    <span className="text-xs text-gray-500">{typeof comment.timestamp === 'string' ? comment.timestamp : comment.timestamp.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.text}</p>
                </div>
              ))}
            </div>

            {user && (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 min-h-[60px]"
                  />
                  <Button onClick={handleComment} disabled={!comment.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>Share your thoughts about this channel</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Write your comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleComment} disabled={!comment.trim()}>
              Post Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Backward compatibility
export const CourseCard = ChannelCard;