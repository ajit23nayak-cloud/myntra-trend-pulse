import { useMemo, useState } from 'react';
import { useProductComparison, useRetailerCoverage, type PriceComparison } from '@/hooks/useDashboardData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Download, Store, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

function toCsv(rows: PriceComparison[]): string {
  const headers = [
    'brand', 'category', 'our_product', 'our_price',
    'competitor', 'their_product', 'their_price',
    'price_gap', 'price_gap_percent', 'our_url', 'their_url',
  ];
  // Quote every field and double any inner quotes, so product names containing
  // commas do not shift columns in Excel.
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  return [
    headers.join(','),
    ...rows.map((r) => [
      r.brand, r.category, r.own_product_name, r.own_price,
      r.competitor, r.competitor_product_name, r.competitor_price,
      r.price_gap, r.price_gap_percent, r.own_product_url, r.competitor_product_url,
    ].map(esc).join(',')),
  ].join('\n');
}

/**
 * Like-for-like pricing against every retailer we track.
 *
 * This is the comparison the dashboard always claimed to make. It could not,
 * because only AJIO was collected and the Myntra side of each row was null.
 */
export function RetailerComparison() {
  const { data: comparisons, isLoading } = useProductComparison();
  const { data: coverage } = useRetailerCoverage();
  const [retailer, setRetailer] = useState<string | null>(null);

  const rows = useMemo(
    () => (comparisons ?? []).filter((c) => !retailer || c.competitor === retailer),
    [comparisons, retailer]
  );

  const competitors = useMemo(
    () => [...new Set((comparisons ?? []).map((c) => c.competitor))].sort(),
    [comparisons]
  );

  const cheaperOnOurs = rows.filter((r) => r.price_gap > 0).length;
  const dearerOnOurs = rows.filter((r) => r.price_gap < 0).length;

  const downloadCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `price-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Who we actually hold prices for. Stating coverage plainly is the only
          way a reader can judge whether a comparison means anything. */}
      {coverage && coverage.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {coverage.map((c) => (
            <div
              key={c.competitor}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs',
                c.isOwnBrand ? 'border-teal/40 bg-teal/10' : 'border-border bg-muted/20'
              )}
            >
              <Store className={cn('w-3.5 h-3.5', c.isOwnBrand ? 'text-teal' : 'text-muted-foreground')} />
              <span className="font-medium text-foreground">{c.competitor}</span>
              {c.isOwnBrand && <Badge variant="outline" className="text-[10px] py-0 border-teal/40 text-teal">ours</Badge>}
              <span className="text-muted-foreground">
                {c.total} products · {c.categories.length} categories
              </span>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <Card className="p-10 text-center">
          <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Matching products across retailers…</p>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-medium text-foreground mb-1">No matched products yet</p>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            A comparison needs the same product found on Myntra and on a competitor in the
            same collection run. Matching is by brand and title, so it only fires when both
            sites list a product we can recognise. Run a refresh, or widen the category grid
            in the scraper.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={retailer === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRetailer(null)}
              >
                All ({comparisons?.length ?? 0})
              </Button>
              {competitors.map((c) => (
                <Button
                  key={c}
                  variant={retailer === c ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRetailer(c)}
                >
                  {c} ({comparisons?.filter((x) => x.competitor === c).length})
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={downloadCsv}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="flex gap-4 text-sm">
            <span className="text-teal">
              <TrendingDown className="w-4 h-4 inline mr-1" />
              {cheaperOnOurs} cheaper on Myntra
            </span>
            <span className="text-coral">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              {dearerOnOurs} cheaper elsewhere
            </span>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Retailer</TableHead>
                    <TableHead className="text-right">Myntra</TableHead>
                    <TableHead className="text-right">Them</TableHead>
                    <TableHead className="text-right">Gap</TableHead>
                    <TableHead className="text-center">Check</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 60).map((r) => {
                    const cheaperHere = r.price_gap > 0;
                    return (
                      <TableRow key={`${r.own_product_id}-${r.competitor_product_id}`}>
                        <TableCell className="max-w-[260px]">
                          <p className="font-medium truncate">{r.own_product_name}</p>
                          <p className="text-xs text-muted-foreground">{r.brand} · {r.category}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{r.competitor}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">₹{Number(r.own_price).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-right">₹{Number(r.competitor_price).toLocaleString('en-IN')}</TableCell>
                        <TableCell className={cn('text-right font-medium', cheaperHere ? 'text-teal' : 'text-coral')}>
                          {cheaperHere ? '−' : '+'}₹{Math.abs(Number(r.price_gap)).toLocaleString('en-IN')}
                          {r.price_gap_percent !== null && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({Math.abs(Number(r.price_gap_percent))}%)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {/* Both sides linked, so any row can be verified at source. */}
                          <div className="flex items-center justify-center gap-2">
                            {r.own_product_url && (
                              <a href={r.own_product_url} target="_blank" rel="noopener noreferrer" title="Open on Myntra">
                                <ExternalLink className="w-3.5 h-3.5 text-teal hover:opacity-70" />
                              </a>
                            )}
                            {r.competitor_product_url && (
                              <a href={r.competitor_product_url} target="_blank" rel="noopener noreferrer" title={`Open on ${r.competitor}`}>
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          <p className="text-xs text-muted-foreground">
            Matched on brand and title, so a product worded very differently on two sites will
            not pair up. Every row links to both source pages — a gap you cannot verify is a
            gap you should not act on.
          </p>
        </>
      )}
    </div>
  );
}
