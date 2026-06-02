'use client';

import { BookOpen } from 'lucide-react';
import { Atom, FlaskConical, Sigma } from 'lucide-react';

export const SubjectIcon = ({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  switch (name) {
    case 'Physics':
      return <Atom className={className} style={style} />;
    case 'Chemistry':
      return <FlaskConical className={className} style={style} />;
    case 'Mathematics':
      return <Sigma className={className} style={style} />;
    default:
      return <BookOpen className={className} style={style} />;
  }
};
