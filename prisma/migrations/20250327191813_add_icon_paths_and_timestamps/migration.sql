-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "iconPath" TEXT DEFAULT '/icons/default-category.svg';

-- AlterTable
ALTER TABLE "Subcategory" ADD COLUMN     "iconPath" TEXT DEFAULT '/subcategories/default.svg';
