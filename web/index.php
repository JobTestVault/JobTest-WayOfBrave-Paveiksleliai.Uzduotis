<?php

require_once __DIR__.'/../vendor/autoload.php';

$app = new Silex\Application();

$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => dirname(__DIR__) . DIRECTORY_SEPARATOR . 'views',
));

$app['debug'] = true;

$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
        'driver'   => 'pdo_sqlite',
        'path'     => dirname(__DIR__).'/include/db.sqlite',
    ),
));

$app->get('/img/{type}/{id}', function ($type, $id) use ($app) {
    switch ($type) {
        case '100x100':
        case '200x200':    
        case '300x300':
            $field = 'resized_' . $type;
        break;
        case 'original':
            $field = $type;
        break;
        default:
            return '';
    }
    $url = $app['db']->fetchColumn('SELECT '.$field.' FROM images WHERE img_id = ? LIMIT 1', array($id), 0);
    $url = parse_url($url);    
    $data = explode(',',$url['path'], 2);    
    $data[0] = explode(';', $data[0]);   
    $data[1] = base64_decode($data[1]);
    return $app->stream(function () use ($data) {
        echo $data[1];
    }, 200, array('Content-Type' => $data[0][0]));
});

$app->get('/', function() use ($app) {
    $sql = 'SELECT img_id, name, resized_100x100 FROM images ORDER BY img_id DESC';
    $res = $app['db']->query($sql);
    $images = array();
    while ($image = $res->fetch()) {
        $image['original'] = './img/original/' . $image['img_id'];        
        $image['resized_200x200'] = './img/200x200/' . $image['img_id'];
        $image['resized_300x300'] = './img/300x300/' . $image['img_id'];
        $images[] = $image;
    }
    return $app['twig']->render('index.twig.html', array(
        'images' => $images
    ));
});

$app->post('/', function () use ($app) {     
     $request = $app['request'];
     $file = $request->request->get('file');     
     if (empty($file))
         return $app->json(array(
             'error' => 'Klaida: failas nenukeliavo iki serverio ;('
         ));
     $name = $request->request->get('name');
     if (!trim($name))
         return $app->json(array(
             'error' => 'Klaida: tusčias paveikslėlio pavadinimas'
         ));
     $url = parse_url($file);
     if (!$url || ($url['scheme'] != 'data'))
         return $app->json(array(
             'error' => 'Klaida: blogas atsiųstas paveikslėlis'
         ));
     $data = explode(',',$url['path'], 2);
     unset($url);
     $request->request->replace(array());
     $data[0] = explode(';', $data[0]);
     if (empty($data[0][0]))
         return $app->json(array(
             'error' => 'Klaida: nežinomo formato paveikslėlis'
         ));
     $data[1] = base64_decode($data[1]);
     if (strlen($data[1]) > 6291456)
         return $app->json(array(
             'error' => 'Klaida: failas per didelis'
         ));     
     $path = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 
                 'wideimage' . DIRECTORY_SEPARATOR . 'WideImage.php';
     require_once $path;
     $img_orig = WideImage::loadFromString($data[1]);
     if (!$img_orig->isValid())
         return $app->json(array(
             'error' => 'Klaida: nepavyko perskaityti paveikslėlio'
         ));     
     if ($img_orig->getWidth() < 300)
         return $app->json(array(
             'error' => 'Klaida: paveikslėlio plotis turi būti nemažesnis nei 300px!',
         ));     
     if ($img_orig->getHeight() < 300)
         return $app->json(array(
             'error' => 'Klaida: paveikslėlio aukštis turi būti nemažesnis nei 300px!',
         ));      
     try {
         $images = array(
             $img_orig->resize(100, 100, 'inside'),
             $img_orig->resize(200, 200, 'inside'),
             $img_orig->resize(300, 300, 'inside')
         );
     } catch (Exception $e) {
         return $app->json(array(
             'error' => 'Klaida: nepavyko sukurti skirtingų dydžių versijų!',
         ));      
     }
     $idata = array(
         'name' => $name,
         'original' => $file,
         'resized_100x100' => 'data:image/png;base64,' . base64_encode($images[0]->asString('png')),
         'resized_200x200' => 'data:image/png;base64,' . base64_encode($images[1]->asString('png')),
         'resized_300x300' => 'data:image/png;base64,' . base64_encode($images[2]->asString('png')),         
     );
     try {
        $r = $app['db']->insert('images', $idata);
        $id = $app['db']->lastInsertId();
        $idata['original'] = './img/original/' . $id;
        $idata['resized_200x200'] = './img/200x200/' . $id;
        $idata['resized_300x300'] = './img/300x300/' . $id;
        return $app->json(array(
                'msg' => 'Paveikslėlis įkeltas sėkmingai!',
                'new_item' => $app['twig']->render('item.twig.html', array(
                    'image' => $idata
                ))
            ));
     } catch (Exception $e) {
        return $app->json(array(
             'error' => 'Klaida: Įvyko kažkokia klaida serveryje!',
         ));      
     }     
});

$app->run();
