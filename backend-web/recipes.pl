% Định nghĩa các công thức món ăn
recipe('Salad Rau Tron', ['rau', 'dua leo', 'ca chua']).
recipe('Trung Chien', ['trung', 'hanh']).
recipe('Ga Ran', ['thit ga', 'bot']).
recipe('Pho Bo', ['thit bo', 'banh pho', 'rau thom', 'hanh', 'que']).
recipe('Bun Cha', ['thit heo', 'bun', 'rau song', 'nuoc mam', 'toi', 'ot']).
recipe('Com Chien Hai San', ['com', 'tom', 'muc', 'trung', 'hanh']).
recipe('Mi Xao Hai San', ['mi', 'tom', 'muc', 'rau cai', 'hanh', 'toi']).
recipe('Lau Thai', ['tom', 'muc', 'thit bo', 'nam', 'rau thom', 'sa', 'la chanh']).
recipe('Banh Mi Xiu Mai', ['banh mi', 'thit heo', 'ca chua', 'hanh', 'rau song']).
recipe('Ga Nuong Mat Ong', ['thit ga', 'mat ong', 'toi', 'gung', 'sa']).
recipe('Com Ga Hoi An', ['com', 'thit ga', 'hanh', 'gung', 'rau thom']).
recipe('Canh Chua Ca', ['ca', 'me', 'ca chua', 'dua', 'rau song']).
recipe('Thit Kho Tau', ['thit heo', 'trung', 'nuoc mam', 'duong', 'toi']).
recipe('Bun Bo Hue', ['bun', 'thit bo', 'cha lua', 'sa', 'toi', 'ot']).

% Định nghĩa các nguyên liệu thay thế
replacement('thit ga', 'thit bo').
replacement('thit heo', 'thit bo').
replacement('thit bo', 'thit heo').
replacement('nuoc mam', 'tuong').
replacement('tuong', 'nuoc mam').
replacement('rau cai', 'rau song').
replacement('rau song', 'rau cai').
replacement('tom', 'muc').
replacement('muc', 'tom').

% Kiểm tra xem danh sách nguyên liệu có thể bao gồm cả nguyên liệu thay thế
ingredient_available(Ingredient, Ingredients) :-
    member(Ingredient, Ingredients).
ingredient_available(Ingredient, Ingredients) :-
    replacement(Ingredient, Alternative),
    member(Alternative, Ingredients).

% Kiểm tra nếu tất cả nguyên liệu (hoặc thay thế của chúng) đều có trong danh sách nguyên liệu
all_ingredients_available([], _).
all_ingredients_available([H | T], Ingredients) :-
    ingredient_available(H, Ingredients),
    all_ingredients_available(T, Ingredients).

% Gợi ý món ăn với hỗ trợ thay thế nguyên liệu
suggest_recipe(Ingredients, Recipe) :-
    recipe(Recipe, Required),
    all_ingredients_available(Required, Ingredients).

% Tìm tất cả các món ăn có thể làm
find_all_recipes(Ingredients, Recipes) :-
    findall(Recipe, suggest_recipe(Ingredients, Recipe), Recipes).

% Tìm món ăn theo tên
find_recipe_by_name(Name, Ingredients) :-
    recipe(Name, Ingredients).

% Liệt kê tất cả nguyên liệu cần thiết cho một món ăn
recipe_ingredients(RecipeName, Ingredients) :-
    recipe(RecipeName, Ingredients).