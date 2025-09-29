---
description: 
globs: 
alwaysApply: true
---
- Carefully consider the component's purpose, functionality, and design.
- Think slowly, step by step, and outline your reasoning.
- Check if a similar component already exists in any of the following locations
  - src/components
- If it doesn't exist, refer primereact doc @https://primereact.org/, https://primereact.org/tailwind/ and create a custom component with prime react component and tailwind css in src/component folder 
Before creating think and list down this:
  - Component name and purpose
  - Desired props and their types
  - Use Tailwind CSS for styling
  - Always Use Typescript types and interface, 'Dont use React.FC pattern'


##Component Coding Rules (Functional Components/Screens)##


##Use the following consistent structure and ordering inside all React functional components:##

1.Hook Calls (Always First)
   - Call all React hooks like `useState`, `useEffect`, `useMemo`, etc., at the top of the component.
   - Do NOT call hooks conditionally or after any early returns or logic branches.

2. Calculation / Derived Values
   - Perform any data derivation, filtering, memoization, or pure calculations immediately after hooks.
   - This includes using `useMemo`, plain logic like `const total = price * quantity`, etc.

3. UI Event Handlers
   - Define all event handler functions used in the JSX (e.g., `handleClick`, `onInputChange`).
   - Prefix event handlers clearly (e.g., `handleSubmit`, `handleToggle`).

4. API/Service Calls
   - Define any async functions for API calls or service interactions after event handlers.
   - Use `useEffect` or events to trigger them as needed.

5. JSX Return
   - Place the `return (...)` statement at the end of the component.
   - The JSX should reference only previously defined state, calculations, and event functions.

API Function Naming Conventions & Order
=======================================

API functions should follow consistent naming patterns and be ordered logically:

**Naming Convention:**
- actions name `get,create,update,delete`
- Use descriptive verbs that clearly indicate the action being performed
- Follow the pattern: `[action][EntityName]` (e.g., `getAccounts`, `createMeeting`, `deleteMeeting`)
- Use camelCase for function names
- Be consistent across similar operations

**Common API Function Names:**
- **GET operations**: `get[Entity]`, `getAll[Entities]`, `get[Entity]By[Field]`
  - Examples: `getAccount`, `getAllAccounts`, `getAccountById`, `getMeetingsByClientId`
- **CREATE operations**: `create[Entity]`, 
  - Examples: `createAccount`
- **UPDATE operations**: `update[Entity]`
  - Examples: `updateAccount`
- **DELETE operations**: `delete[Entity]`
  - Examples: `deleteAccount`, `deleteMeeting`

**API Function Order (within section 4):**
1. **GET functions first** (data fetching)
   - Primary data fetch (e.g., `getAllAccounts`, `getMeetings`)
   - Secondary/filtered fetches (e.g., `getAccountById`, `getMeetingsByClientId`)

2. **CREATE functions** (data creation)
   - Main entity creation (e.g., `createAccount`, `createMeeting`)

3. **UPDATE functions** (data modification)
   - Entity updates (e.g., `updateAccount`, `updateMeeting`)

4. **DELETE functions last** (data removal)
   - Entity deletion (e.g., `deleteAccount`, `deleteMeeting`)

**API Function Structure:**
```tsx
// 4. API Call Functions
const getAllAccounts = async (params: { page: number; limit: number; search?: string }) => {
    setLoading(true);
    try {
//API Method names in service file should always start with processGet, processCreate, processUpdate, processDelete
        const response = await processGetAllAccounts(params);
        setAccounts(response.data);
        setTotalRecords(response.total);
    } catch (error: any) {
        showErrorToast(error.message);
        setAccounts([]);
        setTotalRecords(0);
    } finally {
        setLoading(false);
    }
};

const createAccount = async (data: IAccountForm) => {
    setUploading(true);
    try {
        const response = await processCreateAccount(data);
        // Handle success
        showSuccessToast(response.message);
    } catch (error: any) {
        showErrorToast(error.message);
    } finally {
        setUploading(false);
    }
};

const deleteAccount = async (account: IAccount) => {
    try {
        const response = await processDeleteAccount(account.id.toString());
        // Update local state
        setAccounts(prev => prev.filter(a => a.id !== account.id));
        showSuccessToast(response.message);
    } catch (error: any) {
        showErrorToast(error.message);
    }
};
```

**API Method names in .service.ts file should always start with processGet, processCreate, processUpdate, processDelete**

Example Structure:
------------------
```tsx
export const MyComponent = () => {

  const [count, setCount] = useState(0)
  const { showSuccessToast, showErrorToast } = useToast();


  const doubled = count * 2


  const handleIncrement = () => setCount((c) => c + 1)
  const handleDelete = (item: Item) => setItemToDelete(item)
  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
    }
    setItemToDelete(null);
  };


  const getAllItems = async () => { /* fetch data */ }
  const createItem = async (data: ItemForm) => { /* create item */ }
  const updateItem = async (item: Item) => { /* update item */ }
  const deleteItem = async (item: Item) => { /* delete item */ }


  return <button onClick={handleIncrement}>{doubled}</button>
}
```


