import React, { useContext, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { AppContext } from "../context/AppContext";

const EnhancedForm = ({ defaultValues, onSubmit, children }) => {
    const { currency, autoTemplate } = useContext(AppContext);
    const methods = useForm({
        defaultValues: {
            ...defaultValues,
            selectedCurrency: currency,
        },
    });

    const { reset, setValue } = methods;

    // Sync with global currency if it changes and form is fresh
    useEffect(() => {
        setValue("selectedCurrency", currency);
    }, [currency, setValue]);

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                {children}
            </form>
        </FormProvider>
    );
};

export default EnhancedForm;
