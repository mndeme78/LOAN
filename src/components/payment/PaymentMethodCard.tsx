import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Building,
  Smartphone,
  Star,
  Edit,
  Trash2,
} from "lucide-react";

interface PaymentMethodCardProps {
  id: string;
  type: "card" | "bank" | "mobile";
  name: string;
  details: string;
  isDefault?: boolean;
  onSetDefault?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
  selected?: boolean;
}

export default function PaymentMethodCard({
  id,
  type,
  name,
  details,
  isDefault = false,
  onSetDefault,
  onEdit,
  onDelete,
  onSelect,
  selected = false,
}: PaymentMethodCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (type) {
      case "card":
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case "bank":
        return <Building className="h-5 w-5 text-green-500" />;
      case "mobile":
        return <Smartphone className="h-5 w-5 text-purple-500" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all ${selected ? "ring-2 ring-primary" : ""} ${isHovered ? "shadow-md" : "shadow-sm"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect && onSelect(id)}
    >
      {isDefault && (
        <Badge className="absolute top-2 right-2 bg-green-100 text-green-800 hover:bg-green-100">
          <Star className="h-3 w-3 mr-1 fill-current" /> Default
        </Badge>
      )}
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-muted rounded-md">{getIcon()}</div>
          <div className="flex-1">
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">{details}</p>
          </div>
        </div>

        {isHovered && (
          <div className="flex justify-end space-x-2 mt-4">
            {!isDefault && onSetDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefault(id);
                }}
              >
                Set Default
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
