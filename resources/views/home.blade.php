@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <div class="panel panel-default">
                <div class="panel-heading">Dashboard</div>

                <div class="panel-body">
                    @if (session('status'))
                        <div class="alert alert-success">
                            {{ session('status') }}
                        </div>
                    @endif
                    <p>{{ Auth::user()->username }}</p>
                    <p>{{ Auth::user()->email }}</p>
                    <p>{{ Auth::user()->coins }} Coins</p>
                    <p>{{ Auth::user()->experience }} EXP</p>
                    <p>{{ Auth::user()->image }} </p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
