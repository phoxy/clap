<?php namespace phoxy;

require('vendor/autoload.php');

class clap
{
  private $url;
  private $res;

  public function __construct($url)
  {
    $this->SetURL($url);
  }

  public function SetURL($url)
  {
    $this->url = $url;
    $this->res = null;
  }

  private function Load()
  {
    $phpantomjs = new \phpantomjs\phpantomjs();
    $params = $phpantomjs->BuildParams($this->url, "");
    return $this->res = $phpantomjs->Execute(__DIR__."/clap.js", $params);
  }

  public function Result()
  {
    if ($this->res != null)
      return $this->res;
    return $this->Load();
  }

  public function __toString()
  {
    $body = $this->Result()['sys']['page'];
    return $body;
  }
}
