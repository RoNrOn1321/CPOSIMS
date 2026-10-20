<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentAccountController extends Controller
{
    /**
     * Display a paginated listing of enrolled students with RFID card statuses.
     */
    public function index(Request $request): Response
    {
        $query = StudentAccount::with('parent:id,full_name,username,email');

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('student_id_number', 'like', "%{$search}%")
                    ->orWhere('rfid_uid', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $students = $query->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(15)
            ->withQueryString();

        $parents = User::where('role', 'parent')
            ->where('status', 'active')
            ->orderBy('full_name')
            ->limit(15)
            ->get(['id', 'full_name', 'username', 'email']);

        $metrics = [
            'totalStudents' => StudentAccount::count(),
            'activeCards' => StudentAccount::where('status', 'active')->whereNotNull('rfid_uid')->count(),
            'lostOrSuspendedCards' => StudentAccount::whereIn('status', ['lost_card', 'suspended'])->count(),
            'totalStoredBalance' => (float) (StudentAccount::sum('current_balance') ?? 0),
        ];

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'parents' => $parents,
            'metrics' => $metrics,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
            ],
        ]);
    }

    /**
     * Enroll a new student account in the system.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id_number' => ['required', 'string', 'max:30', 'unique:student_accounts,student_id_number'],
            'rfid_uid' => ['nullable', 'string', 'max:64', 'unique:student_accounts,rfid_uid'],
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'grade_level' => ['required', 'string', 'max:30'],
            'section' => ['required', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer', 'exists:users,id'],
            'daily_spending_limit' => ['required', 'numeric', 'min:0', 'max:10000'],
            'is_spending_limited' => ['required', 'boolean'],
            'status' => ['required', 'string', 'in:active,suspended,lost_card,inactive'],
        ]);

        $validated['rfid_uid'] = ! empty($validated['rfid_uid']) ? trim($validated['rfid_uid']) : null;
        $validated['parent_id'] = ! empty($validated['parent_id']) ? (int) $validated['parent_id'] : null;
        $validated['current_balance'] = 0.00;

        $student = StudentAccount::create($validated);

        return redirect()->route('admin.students.index')
            ->with('success', "Student {$student->first_name} {$student->last_name} enrolled successfully.");
    }

    /**
     * Update an existing student's details, reassign an RFID card, or adjust limits.
     */
    public function update(Request $request, StudentAccount $student): RedirectResponse
    {
        $validated = $request->validate([
            'student_id_number' => [
                'required',
                'string',
                'max:30',
                Rule::unique('student_accounts', 'student_id_number')->ignore($student->id),
            ],
            'rfid_uid' => [
                'nullable',
                'string',
                'max:64',
                Rule::unique('student_accounts', 'rfid_uid')->ignore($student->id),
            ],
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'grade_level' => ['required', 'string', 'max:30'],
            'section' => ['required', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer', 'exists:users,id'],
            'daily_spending_limit' => ['required', 'numeric', 'min:0', 'max:10000'],
            'is_spending_limited' => ['required', 'boolean'],
            'status' => ['required', 'string', 'in:active,suspended,lost_card,inactive'],
        ]);

        $validated['rfid_uid'] = ! empty($validated['rfid_uid']) ? trim($validated['rfid_uid']) : null;
        $validated['parent_id'] = ! empty($validated['parent_id']) ? (int) $validated['parent_id'] : null;

        $student->update($validated);

        return redirect()->route('admin.students.index')
            ->with('success', "Student {$student->first_name} {$student->last_name} updated successfully.");
    }

    /**
     * Async debounced search for active parents.
     */
    public function searchParents(Request $request): JsonResponse
    {
        $search = trim($request->input('q', ''));

        $parents = User::where('role', 'parent')
            ->where('status', 'active')
            ->when(! empty($search), function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('full_name')
            ->limit(15)
            ->get(['id', 'full_name', 'username', 'email']);

        return response()->json($parents);
    }
}
