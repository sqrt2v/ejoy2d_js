local json = require('json')

local f, o = ...

print('---->>> input f:', f)

local data = require(f)

local types = {
    empty =0,
    picture =1,
    animation =2,
    polygon = 3,
    label = 4,
    pannel = 5,
    anchor = 6,
    matrix = 7,
}

local rlt = {}
for k,v in pairs(data) do
    local t = {}
    t[1] = assert(types[v.type])
    if v.type == 'matrix' then
        t[2] = v[1]
    elseif v.type == 'picture' then
        t[2] = v.id
        local p = {}
        t[3] = p
        local info = v[1]
        p[1] = info.tex
        p[2] = info.src
        p[3] = info.screen
    elseif v.type == 'animation' then
        t[2] = v.id
        -- components
        local cc = {}
        for _, cmp in ipairs(v.component) do
            if not cmp.name then
                table.insert(cc, cmp.id)
            else
                local c = {}
                if not cmp.id then
                    c[1] = -1
                else
                    c[1] = cmp.id
                end
                c[2] = cmp.name
                table.insert(cc, c)
            end
        end
        t[3] = cc
        -- frame
        local frames = {}
        for _, f in ipairs(v[1]) do
            local nf = {}
            for _, sf in ipairs(f) do
                if type(sf) == 'table' then
                    local fc = {}
                    fc[1] = sf.index
                    fc[2] = sf.mat
                    if sf.touch then
                        fc[3] = sf.touch
                    end
                    table.insert(nf, fc)
                else
                    table.insert(nf, sf)
                end
            end
            table.insert(frames, nf)
        end
        t[4] = frames
        if v.export then
            t[5] = v.export
        end
    elseif v.type == 'label' then
        print("-------aoaooaaoaoa -------->>>>", v.id)
        t[2] = v.id
        t[3] = v.color
        t[4] = v.width
        t[5] = v.height
        t[6] = v.align
        t[7] = v.size
        t[8] = v.noedge
    elseif v.type == 'pannel' then
        t[2] = v.id
        t[3] = v.width
        t[4] = v.height
        t[5] = v.scissor
    end
    rlt[k] = t
end

local of = io.open(o..'.json', 'w')
of:write(json.encode(rlt))
of:close()

print('--->> done:', f)




