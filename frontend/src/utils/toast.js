import toast from 'react-hot-toast';

// Success toast
export const showSuccess = (message) => {
    toast.success(message, {
        duration: 3000,
        position: 'top-right',
        style: {
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontWeight: '500'
        },
        icon: '✅'
    });
};

// Error toast
export const showError = (message) => {
    toast.error(message, {
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontWeight: '500'
        },
        icon: '❌'
    });
};

// Info toast
export const showInfo = (message) => {
    toast(message, {
        duration: 3000,
        position: 'top-right',
        style: {
            background: '#3b82f6',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontWeight: '500'
        },
        icon: 'ℹ️'
    });
};

// Warning toast
export const showWarning = (message) => {
    toast(message, {
        duration: 3500,
        position: 'top-right',
        style: {
            background: '#f59e0b',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontWeight: '500'
        },
        icon: '⚠️'
    });
};

// Loading toast
export const showLoading = (message) => {
    return toast.loading(message, {
        position: 'top-right',
        style: {
            background: '#6366f1',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontWeight: '500'
        }
    });
};

// Dismiss toast
export const dismissToast = (toastId) => {
    toast.dismiss(toastId);
};

// Promise toast (for async operations)
export const showPromise = (promise, messages) => {
    return toast.promise(
        promise,
        {
            loading: messages.loading || 'Loading...',
            success: messages.success || 'Success!',
            error: messages.error || 'Error occurred'
        },
        {
            position: 'top-right',
            style: {
                padding: '16px',
                borderRadius: '12px',
                fontWeight: '500'
            }
        }
    );
};

export default {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    loading: showLoading,
    dismiss: dismissToast,
    promise: showPromise
};
