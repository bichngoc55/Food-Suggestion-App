:- discontiguous suggest_recipe_by_match_percentage/3.
:- discontiguous count_matching_ingredients/4.
:- discontiguous count_available/3.
% Định nghĩa các công thức món ăn
recipe('Salad Rau Tron', ['rau', 'dua leo', 'ca chua']).
recipe('Trung Chien', ['trung', 'hanh']).
recipe('Ga Ran', ['thit ga', 'bot']).
recipe('Pho Bo', ['thit bo', 'banh pho', 'rau thom', 'hanh', 'que']).
recipe('Bun Cha', ['thit heo', 'bun', 'rau song', 'nuoc mam', 'toi', 'ot']).
recipe('Com Chien Hai San', ['com', 'tom', 'muc', 'trung', 'hanh']).
recipe('Mi Xao Hai San', ['mi', 'tom', 'muc', 'rau cai', 'hanh', 'toi']).
recipe('Lau Thai', ['tom', 'muc', 'thit bo', 'nam', 'rau thom', 'sa', 'la chanh']).
recipe('Banh Mi Xiu Mai', ['banh mi', 'thit heo', 'ca chua', 'hanh', 'rau song', 'nam']).
recipe('Ga Nuong Mat Ong', ['thit ga', 'mat ong', 'nuoc tuong', 'toi', 'gung', 'sa']).
recipe('Com Ga Hoi An', ['com', 'thit ga', 'rau ram', 'hanh', 'gung', 'sa', 'rau thom']).
recipe('Canh Chua Ca', ['ca', 'dau bap', 'bac ha', 'me', 'rau thom', 'ca chua', 'dua']).
recipe('Thit Kho Tau', ['thit heo', 'trung', 'nuoc mam', 'nuoc dua', 'hanh', 'toi', 'duong']).
recipe('Bun Bo Hue', ['thit bo', 'bun', 'cha lua', 'sa', 'toi', 'ot', 'rau muong', 'gia']).
recipe('Lau Hai San', ['tom', 'muc', 'ca', 'nam', 'rau muong', 'bap cai', 'hanh', 'toi']).
recipe('Bo Kho', ['thit bo', 'ca rot', 'khoai tay', 'hanh', 'toi', 'sa', 'que']).
recipe('Banh Xeo', ['bot gao', 'thit heo', 'tom', 'gia', 'rau song']).
recipe('Goi Cuon', ['banh trang', 'thit heo', 'tom', 'bun', 'rau song', 'rau thom']).

% Định nghĩa các nguyên liệu thay thế
replacement('thit ga', 'thit bo').
replacement('thit ga', 'thit heo').
replacement('thit heo', 'thit bo').
replacement('thit heo', 'thit ga').
replacement('thit bo', 'thit heo').
replacement('thit bo', 'thit ga').
replacement('nuoc mam', 'tuong').
replacement('nuoc tuong', 'nuoc mam').
replacement('mi', 'bun').
replacement('bun', 'mi').
replacement('ca', 'tom').
replacement('tom', 'muc').
replacement('muc', 'ca').
replacement('rau muong', 'rau cai').
replacement('bap cai', 'rau muong').
replacement('dua leo', 'ca chua').
replacement('bot gao', 'bot mi').

% Định nghĩa các gia vị thay thế
spice_replacement('toi', 'hanh').
spice_replacement('hanh', 'toi').
spice_replacement('hanh', 'hanh la').
spice_replacement('ot', 'tieu').
spice_replacement('sa', 'hung').
spice_replacement('hung', 'rau mui').
spice_replacement('gung', 'nghe').
spice_replacement('que', 'hoi').
spice_replacement('rau thom', 'rau hung').
spice_replacement('rau ram', 'rau hung').

% Kiểm tra xem nguyên liệu có sẵn hay không
direct_ingredient_available(Ingredient, Ingredients) :- member(Ingredient, Ingredients).
replacement_available(Ingredient, Ingredients) :- replacement(Ingredient, Alternative), member(Alternative, Ingredients).
spice_replacement_available(Ingredient, Ingredients) :- spice_replacement(Ingredient, Alternative), member(Alternative, Ingredients).
ingredient_available(Ingredient, Ingredients) :- direct_ingredient_available(Ingredient, Ingredients).
ingredient_available(Ingredient, Ingredients) :- replacement_available(Ingredient, Ingredients).
ingredient_available(Ingredient, Ingredients) :- spice_replacement_available(Ingredient, Ingredients).

% Kiểm tra tất cả nguyên liệu cần thiết
all_ingredients_available([], _).
all_ingredients_available([H|T], Ingredients) :- 
    ingredient_available(H, Ingredients), 
    all_ingredients_available(T, Ingredients).

% Đếm số lượng nguyên liệu khớp
count_available([], _, 0).
count_available([H|T], Ingredients, Count) :-
    count_available(T, Ingredients, RestCount),
    (ingredient_available(H, Ingredients) -> Count is RestCount + 1 ; Count = RestCount).

count_matching_ingredients(Required, Ingredients, Available, Total) :-
    length(Required, Total),
    count_available(Required, Ingredients, Available).

% Gợi ý món ăn với tỷ lệ phù hợp
suggest_recipe_by_match_percentage(Ingredients, Recipe, Percentage) :-
    recipe(Recipe, Required),
    count_matching_ingredients(Required, Ingredients, Available, Total),
    Total > 0,
    Percentage is (Available / Total) * 100,
    Percentage >= 60.

% Gợi ý món ăn với nguyên liệu khớp hoàn toàn
suggest_exact_recipe(Ingredients, Recipe) :-
    recipe(Recipe, Required),
    subset(Required, Ingredients).

% Tìm tất cả món ăn có thể làm (ưu tiên khớp hoàn toàn)
find_all_recipes(Ingredients, Recipes) :-
    (   setof(Recipe, suggest_exact_recipe(Ingredients, Recipe), ExactRecipes)
    ->  Recipes = ExactRecipes
    ;   setof(Recipe, (suggest_recipe_by_match_percentage(Ingredients, Recipe, Percentage), Percentage >= 80), Recipes)
    ).

% Gợi ý món ăn với hỗ trợ thay thế
suggest_recipe(Ingredients, Recipe) :-
    recipe(Recipe, Required),
    all_ingredients_available(Required, Ingredients).

% Gợi ý món ăn với nguyên liệu khớp hoàn toàn
suggest_exact_recipe(Ingredients, Recipe) :-
    recipe(Recipe, Required),
    subset(Required, Ingredients). % Kiểm tra Required là tập con của Ingredients

% Tìm tất cả món ăn khớp hoàn toàn
find_exact_recipes(Ingredients, Recipes) :-
    setof(Recipe, suggest_exact_recipe(Ingredients, Recipe), Recipes).