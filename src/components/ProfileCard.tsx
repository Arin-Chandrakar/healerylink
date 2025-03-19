
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  name: string;
  specialty?: string;
  location?: string;
  rating?: number;
  verified?: boolean;
  imageUrl?: string;
  isDoctor?: boolean;
  className?: string;
  onClick?: () => void;
}

const ProfileCard = ({
  name,
  specialty,
  location,
  rating,
  verified = false,
  imageUrl,
  isDoctor = true,
  className,
  onClick,
}: ProfileCardProps) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex gap-3 items-center">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-1">
                {name}
                {verified && (
                  <CheckCircle2 className="h-4 w-4 text-blue-500 ml-1" />
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {isDoctor ? specialty : 'Patient'}
              </CardDescription>
            </div>
          </div>
          
          {isDoctor && rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium text-sm">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {location && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
          </div>
        )}
        
        {isDoctor && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
              Online Consult
            </Badge>
            <Badge variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
              Available Today
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
