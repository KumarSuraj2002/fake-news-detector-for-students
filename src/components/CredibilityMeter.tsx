import { Shield, AlertTriangle, XCircle } from "lucide-react";

interface CredibilityMeterProps {
  score: number;
  determination: "credible" | "questionable" | "fake";
}

export const CredibilityMeter = ({ score, determination }: CredibilityMeterProps) => {
  const getStyles = () => {
    if (determination === "credible") {
      return {
        icon: <Shield className="w-8 h-8 text-success" />,
        label: "Likely Credible",
        scoreColor: "text-success",
        gradient: "bg-gradient-trust",
        badge: "bg-success/10 text-success",
      };
    }
    if (determination === "questionable") {
      return {
        icon: <AlertTriangle className="w-8 h-8 text-secondary" />,
        label: "Questionable",
        scoreColor: "text-secondary",
        gradient: "bg-gradient-warning",
        badge: "bg-secondary/10 text-secondary",
      };
    }
    return {
      icon: <XCircle className="w-8 h-8 text-destructive" />,
      label: "Likely Fake",
      scoreColor: "text-destructive",
      gradient: "bg-gradient-danger",
      badge: "bg-destructive/10 text-destructive",
    };
  };

  const styles = getStyles();
  const percentage = score;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-xl shadow-card">
      <div>
        {styles.icon}
      </div>
      
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-muted-foreground">Credibility Score</span>
          <span className={`text-2xl font-bold ${styles.scoreColor}`}>{score}/100</span>
        </div>
        
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${styles.gradient} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="mt-3 text-center">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${styles.badge}`}>
            {styles.label}
          </span>
        </div>
      </div>
    </div>
  );
};
