<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use OwenIt\Auditing\Models\Audit;

class AuditLogController extends Controller
{
    /**
     * Display a listing of inventory logs and system audits.
     */
    public function index(Request $request): Response
    {
        $inventoryQuery = InventoryLog::with([
            'product' => fn ($q) => $q->withTrashed(),
            'user',
        ]);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $inventoryQuery->where(function ($q) use ($search) {
                $q->where('remarks', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($pq) use ($search) {
                        $pq->where('name', 'like', "%{$search}%")
                            ->orWhere('barcode', 'like', "%{$search}%");
                    })
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('full_name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('action')) {
            $inventoryQuery->where('action', $request->input('action'));
        }

        $inventoryLogs = $inventoryQuery->latest()->paginate(15, ['*'], 'page')->withQueryString();

        $audits = Audit::with('user')->latest()->paginate(15, ['*'], 'audit_page')->withQueryString();

        $totalInventoryEvents = InventoryLog::count();
        $totalSystemAudits = Audit::count();
        $totalAdjustments = InventoryLog::where('action', 'adjustment')->count();

        return Inertia::render('Admin/AuditLogs/Index', [
            'inventoryLogs' => $inventoryLogs,
            'audits' => $audits,
            'metrics' => [
                'totalEvents' => $totalInventoryEvents + $totalSystemAudits,
                'inventoryEvents' => $totalInventoryEvents,
                'systemAudits' => $totalSystemAudits,
                'inventoryAdjustments' => $totalAdjustments,
            ],
            'filters' => $request->only(['search', 'action']),
        ]);
    }
}
