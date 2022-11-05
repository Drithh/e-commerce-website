import Card from '../components/Card';
import { useQuery } from 'react-query';
import { CategoryService, ProductService } from '../api';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { capitalCase } from 'change-case';
import { CiDollar } from 'react-icons/ci';
import Dropdown from '../components/Dropdown';
const pluralize = require('pluralize');

interface TypeParams {
  category: Array<string>;
  page: number;
  pageSize: number;
  sortBy: string;
  price: Array<number>;
  condition: string;
  productName: string;
}

const Product: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [params, setParams] = useState<TypeParams>({
    category: [],
    page: 1,
    pageSize: 20,
    sortBy: 'Title a_z',
    price: [],
    condition: '',
    productName: '',
  });

  const fetchProducts = useQuery(
    ['products', params],
    () =>
      ProductService.getProducts(
        params.category,
        params.page,
        params.pageSize,
        params.sortBy,
        params.price,
        params.condition,
        params.productName
      ),
    {
      staleTime: Infinity,
    }
  );
  // if searchParams changes, fetchProducts will be enabled
  useEffect(() => {
    console.log('searchParams changed');
    // fetchProducts.refetch();
  }, [searchParams]);

  if (fetchProducts.isError) {
    return <div>Error...</div>;
  }

  return (
    <main id="main-content" className="mx-auto mt-20 min-h-[60vh] max-w-7xl">
      {/* ===== Heading & Continue Shopping */}
      <div className="w-full border-t-2 border-gray-100 ">
        <h1 className="animatee__animated animate__bounce mt-6 mb-2 text-center text-2xl sm:text-left sm:text-4xl">
          Product
        </h1>
      </div>

      {/* ===== Product Section ===== */}
      <div className="flex gap-x-4 min-h-screen">
        <section className="border-x-gray-100 border-x w-72 h-fit  ">
          <SortMenu params={params} setParams={setParams} />
        </section>
        {fetchProducts.data && fetchProducts.data?.data.length > 0 ? (
          <section className="grid grid-cols-4 gap-4">
            {fetchProducts.data?.data.map((product) => (
              <Card key={product.id} item={product} />
            ))}
          </section>
        ) : (
          <div className="not-found flex flex-col gap-y-4 items-center  w-full text-2xl h-full py-[10%]">
            <strong>Oops! No product found</strong>
            <div>Please try again with different keywords or filters</div>
          </div>
        )}
      </div>
    </main>
  );
};

interface SortMenuProps {
  params: TypeParams;
  setParams: React.Dispatch<React.SetStateAction<TypeParams>>;
}

const SortMenu: React.FC<SortMenuProps> = ({ params, setParams }) => {
  const [, setSearchParams] = useSearchParams();

  const fetchCategories = useQuery(
    'categories',
    () => CategoryService.getCategory(),
    {
      staleTime: Infinity,
    }
  );

  const conditions = ['new', 'used'];

  useEffect(() => {
    console.log(params);
    const requestParams = new URLSearchParams();
    requestParams.append('page', params.page.toString());
    requestParams.append('page_size', params.pageSize.toString());
    requestParams.append('sort_by', params.sortBy);
    params.category.forEach((single_category) => {
      requestParams.append('category', single_category);
    });
    params.price.forEach((single_price) => {
      if (single_price) {
        requestParams.append('price', single_price.toString());
      }
    });
    if (params.condition.length > 0) {
      requestParams.append('condition', params.condition);
    }
    if (params.productName.length > 0) {
      requestParams.append('product_name', params.productName);
    }
    setSearchParams(requestParams);
  }, [params, setSearchParams]);

  if (fetchCategories.isLoading) {
    return <div>Loading...</div>;
  }

  if (fetchCategories.isError || !fetchCategories.data) {
    return <div>Error...</div>;
  }

  const categories = fetchCategories.data.data;
  const categoriesByType = categories.reduce((acc, category) => {
    const { type } = category;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(category);
    return acc;
  }, {} as Record<string, Array<any>>);

  return (
    <div className="flex flex-col  w-full text-gray-600">
      <div className="border-y-gray-100 border-y px-4 py-5 ">
        Showing 1-12 of 100 results
      </div>
      <div className="flex flex-col gap-y-4 border-b-gray-100 border-b px-4 pt-3 pb-4 ">
        {Object.entries(categoriesByType).map(([type, categories]) => (
          <div key={type}>
            <h2 className="mb-2 text-xl text-black">
              {pluralize(capitalCase(type, { delimiter: ' & ' }))}
            </h2>
            <ul className="flex flex-col gap-y-2">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center ">
                  <input
                    type="checkbox"
                    id={category.id}
                    name={pluralize.singular(capitalCase(category.title))}
                    value={category.id}
                    onChange={(e) => {
                      const { checked, value } = e.target;
                      if (checked) {
                        setParams((prev) => ({
                          ...prev,
                          category: [...prev.category, value],
                        }));
                      } else {
                        setParams((prev) => ({
                          ...prev,
                          category: prev.category.filter(
                            (item) => item !== value
                          ),
                        }));
                      }
                    }}
                    className="mx-2 text-gray-600 border-gray-300 accent-gray-600  h-4 w-4"
                  />
                  {pluralize.singular(capitalCase(category.title))}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="sort px-4 py-3 border-b-gray-100 border-b">
        <h2 className="mb-2 text-xl text-black">Sort By</h2>
        <Dropdown params={params} setParams={setParams} />
      </div>
      <div className="price px-4 py-3 gap-y-4 flex flex-col border-b-gray-100 border-b">
        <fieldset className="price-wrapper">
          <legend className="mb-3 text-xl text-black">Minimum Price</legend>
          <div className="input-price flex rounded px-3 py-1 border-gray-300 border items-center gap-x-2">
            <CiDollar className="text-3xl text-gray-400" />
            <input
              type="number"
              name="min-price"
              id="min-price"
              className="w-full h-5"
              placeholder="0"
              onBlur={(e) => {
                const value = e.target.value;
                if (value) {
                  setParams((prev) => ({
                    ...prev,
                    price: [Number(value), prev.price[1]],
                  }));
                }
              }}
            />
          </div>
        </fieldset>
        <fieldset className="price-wrapper">
          <legend className="mb-3 text-xl text-black">Maximum Price</legend>
          <div className="input-price flex rounded px-3 py-1 border-gray-300 border items-center gap-x-2">
            <CiDollar className="text-3xl text-gray-400" />
            <input
              type="number"
              name="max-price"
              id="max-price"
              className="w-full h-5"
              onBlur={(e) => {
                const value = e.target.value;
                if (value) {
                  setParams((prev) => ({
                    ...prev,
                    price: [prev.price[0] || 0, Number(value)],
                  }));
                }
              }}
              placeholder="999999"
            />
          </div>
        </fieldset>
      </div>
      <div className="flex flex-col gap-y-3 border-b-gray-100 border-b px-4 py-3 ">
        <h2 className="text-xl text-black">Condition</h2>
        <ul className="flex flex-col gap-y-2">
          {conditions.map((condition, index) => (
            <li key={index} className="flex items-center ">
              <input
                type="radio"
                name="condition"
                value={condition}
                onChange={(e) => {
                  const { checked, value } = e.target;
                  if (checked) {
                    setParams((prev) => ({
                      ...prev,
                      condition: value,
                    }));
                  }
                }}
                className="mx-2 text-gray-600 border-gray-300 accent-gray-600  h-4 w-4"
              />
              {capitalCase(condition)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Product;
