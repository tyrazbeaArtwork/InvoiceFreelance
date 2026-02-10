
import React from 'react';
import FloatingLabelInput from './FloatingLabelInput';
import { Trash2, GripVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from '../utils/formatCurrency.js';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ItemDetails = ({ items, handleItemChange, addItem, removeItem, currencyCode: propCurrencyCode, onDragEnd }) => {
  const currencyCode = propCurrencyCode || 'MYR';
  const currencySymbol = getCurrencySymbol(currencyCode);

  return (
    <div className="mb-8">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="items-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-5">
              {items.map((item, index) => (
                <Draggable key={item.id || index} draggableId={String(item.id || index)} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white border border-gray-100 rounded-2xl shadow-sm transition-all duration-200 ${snapshot.isDragging
                          ? 'shadow-xl ring-2 ring-blue-200 scale-[1.01]'
                          : 'hover:shadow-md'
                        }`}
                    >
                      {/* Header Row: Grip + Badge + Title + Delete */}
                      <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
                          title="Drag to reorder"
                        >
                          <GripVertical size={20} />
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-7 h-7 bg-blue-500 text-white text-xs font-bold rounded-lg">
                            {index + 1}
                          </span>
                          <span className="font-semibold text-gray-800">Line Item</span>
                        </div>

                        <div className="flex-grow"></div>

                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all h-9 w-9"
                            onClick={() => removeItem(index)}
                            title="Remove item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>

                      {/* Form Fields */}
                      <div className="px-5 py-5">
                        {/* Main Fields Row */}
                        <div className="grid grid-cols-12 gap-4 mb-5">
                          <div className="col-span-12 md:col-span-4">
                            <FloatingLabelInput
                              id={`itemName${index}`}
                              label="Service/Item Name"
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              placeholder="Logo Design & V"
                            />
                          </div>
                          <div className="col-span-4 md:col-span-2">
                            <FloatingLabelInput
                              id={`itemQuantity${index}`}
                              label="Qty / Hrs"
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                              placeholder="1"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div className="col-span-4 md:col-span-3">
                            <FloatingLabelInput
                              id={`itemAmount${index}`}
                              label={`Rate (${currencySymbol})`}
                              type="number"
                              value={item.amount}
                              onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value))}
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                            />
                          </div>
                          <div className="col-span-4 md:col-span-3">
                            <div className="relative">
                              <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400 font-medium">
                                Total ({currencySymbol})
                              </label>
                              <div className="h-[50px] px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-right font-bold text-blue-600 text-lg flex items-center justify-end">
                                {(item.quantity * item.amount).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description Row */}
                        <div>
                          <FloatingLabelInput
                            id={`itemDescription${index}`}
                            label="Additional Description (Optional)"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Primary logo design with 5 concept variations, horizontal/vertical layouts, monochrome ve"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Item Button */}
      <button
        type="button"
        onClick={addItem}
        className="mt-5 bg-white text-blue-500 border-2 border-dashed border-blue-200 w-full py-5 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all font-semibold flex items-center justify-center gap-3 group"
      >
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="text-xl font-light text-blue-500">+</span>
        </div>
        Add New Line Item
      </button>
    </div>
  );
};

export default ItemDetails;
