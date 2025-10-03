'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function TestAuthPage() {
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setResult(`Error: ${error.message}`);
      } else {
        setResult(`Success! Session: ${data.session ? 'Active' : 'None'}`);
      }
    } catch (err) {
      setResult(`Exception: ${err}`);
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Auth Connection Test</h1>
      <Button onClick={testConnection}>Test Supabase Connection</Button>
      {result && (
        <div className="p-4 bg-muted rounded">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
